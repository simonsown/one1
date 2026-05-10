'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Cpu, ArrowRight, Plus, Loader2, GraduationCap, Award, CheckCircle, TrendingUp, Trophy, HelpCircle, FileText, ChevronRight, Clock } from 'lucide-react';
import JoinClassModal from '../../../components/JoinClassModal';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import Onboarding from '@/components/Onboarding';
import DailyQuests from '@/components/DailyQuests';

export default function StudentDashboard() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [profile, setProfile] = useState<any>(null);
  const [progressCount, setProgressCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchData();

    // REAL-TIME SUBSCRIPTION
    const lessonsChannel = supabase
      .channel('public:lessons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lessons' }, () => {
        fetchData();
      })
      .subscribe();

    const assignmentsChannel = supabase
      .channel('public:assignments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(lessonsChannel);
      supabase.removeChannel(assignmentsChannel);
    };
  }, []);

  async function fetchData() {
    // ... rest of the logic remains same
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch profile for XP
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      // 2. Fetch joined classes
      const { data: memberships } = await supabase
        .from('class_members')
        .select(`
          class_id,
          classes:class_id (
            id,
            name,
            code,
            subject,
            teacher_id,
            profiles:teacher_id (full_name)
          )
        `)
        .eq('student_id', user.id);

      const joinedClasses = memberships?.map((m: any) => m.classes) || [];
      setClasses(joinedClasses);

      // 3. Fetch assignments count
      const classIds = joinedClasses.map((c: any) => c.id);
      if (classIds.length > 0) {
        const { count } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('is_published', true);
        setAssignmentCount(count || 0);
      }

      // 4. Fetch lesson progress (Real-time tracking)
      const { count: progCount } = await supabase
        .from('lesson_progress')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true);
      setProgressCount(progCount || 0);

      // 5. Fetch "Khám phá Kiến thức" (Lessons from joined classes)
      if (classIds.length > 0) {
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('*, profiles:teacher_id (full_name)')
          .eq('is_published', true)
          .limit(6);
        setLessons(lessonData || []);
      }

    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Onboarding />
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-[#00d2a0]/10 text-[#00d2a0] rounded-full text-xs font-bold uppercase tracking-wider">Học viên PC Master</span>
            <span className="flex items-center gap-1.5 text-xs text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-full">
              🔥 5 ngày liên tiếp
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Chào buổi sáng, <span className="text-[#00d2a0]">{profile?.full_name?.split(' ')[0] || 'Học viên'}!</span> 👋
          </h1>
          <p className="text-slate-400 text-lg">Hôm nay là một ngày tuyệt vời để nâng cấp kiến thức của bạn.</p>
        </motion.div>
        
        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowJoinModal(true)}
          className="flex items-center gap-3 px-8 py-4 bg-[#00d2a0] text-black font-bold rounded-2xl shadow-[0_0_20px_rgba(0,210,160,0.2)] hover:shadow-[0_0_30px_rgba(0,210,160,0.4)] transition-all"
        >
          <Plus size={24} /> Tham gia lớp học
        </motion.button>
      </header>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Lớp học" value={classes.length} icon={<Users size={24} />} color="#06b6d4" />
        <StatCard label="Hoàn thành" value={progressCount} icon={<CheckCircle size={24} />} color="#10b981" />
        <StatCard label="Bài tập" value={assignmentCount} icon={<BookOpen size={24} />} color="#f59e0b" />
        <StatCard label="Điểm XP" value={progressCount * 150} icon={<Trophy size={24} />} color="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Continue Learning - Real data */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          {lessons.length > 0 ? (
            <div className="bg-[#16213e] border border-[#1e293b] rounded-[32px] p-8 relative overflow-hidden group h-full">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Cpu size={120} />
              </div>
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-[#00d2a0] uppercase tracking-widest mb-4">Gợi ý bài học</h3>
                <h2 className="text-2xl font-bold mb-2">{lessons[0].title}</h2>
                <p className="text-slate-400 mb-6 max-w-md">{lessons[0].description || 'Khám phá bài học này để nâng cao trình độ của bạn.'}</p>
                <div className="flex items-center gap-4">
                  <Link href={`/lessons/${lessons[0].id}`} className="px-6 py-3 bg-[#00d2a0] text-black font-bold rounded-xl hover:bg-[#00e6af] transition-all">
                    BẮT ĐẦU HỌC
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#16213e]/30 border border-dashed border-[#1e293b] rounded-[32px] p-8 flex flex-col items-center justify-center text-center h-full">
              <BookOpen size={48} className="text-slate-600 mb-4" />
              <p className="text-slate-500 font-medium italic">Chưa có bài học nào dành cho bạn.</p>
            </div>
          )}
        </motion.div>
        
        {/* Class Leaderboard - Placeholder to Real if data exists */}
        {/* Student Quick Links */}
        <motion.div variants={itemVariants} className="bg-[#16213e] border border-[#1e293b] rounded-[32px] p-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" /> Hoạt động của bạn
          </h3>
          <div className="space-y-4">
            <Link href="/exams" className="flex items-center justify-between p-4 bg-[#0f0f1a] rounded-2xl border border-[#1e293b] hover:border-[#00d2a0]/50 transition-all group">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-[#00d2a0]" />
                <span className="text-sm font-bold">Kỳ thi sắp tới</span>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-white" />
            </Link>

            <Link href="/quiz" className="flex items-center justify-between p-4 bg-[#0f0f1a] rounded-2xl border border-[#1e293b] hover:border-[#00d2a0]/50 transition-all group">
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-orange-500" />
                <span className="text-sm font-bold">Luyện tập trắc nghiệm</span>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-white" />
            </Link>
            
            <Link href="/leaderboard" className="block text-center text-xs font-bold text-slate-500 hover:text-[#00d2a0] transition-colors mt-4 uppercase tracking-widest">
               Xem bảng xếp hạng toàn cầu
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Khám phá Kiến thức Section */}
          <motion.section variants={itemVariants} className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <BookOpen size={24} className="text-[#00d2a0]" />
                <h2 className="text-2xl font-bold text-white">Khám phá kiến thức</h2>
              </div>
              <Link href="/courses" className="text-[#00d2a0] text-sm font-bold hover:underline">Tất cả bài học</Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#00d2a0]" /></div>
            ) : lessons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessons.map((lsn: any) => (
                      <div className="flex-1 p-4 rounded-2xl bg-[#0f0f1a] border border-[#1e293b] hover:border-[#00d2a0] transition-all group">
                        <div className="flex items-center justify-between mb-2">
                           <span className="px-2 py-0.5 bg-[#00d2a0]/10 text-[#00d2a0] text-[10px] font-bold rounded uppercase">{lsn.category || 'Phần cứng'}</span>
                           <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                              <Clock size={10} /> 45 phút
                           </div>
                        </div>
                        <h4 className="font-bold text-white group-hover:text-[#00d2a0] transition-colors mb-4 line-clamp-1">{lsn.title}</h4>
                        <Link href={`/courses/${lsn.course_id || lsn.id}`} className="w-full py-2 bg-[#1e293b] text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 group-hover:bg-[#00d2a0] group-hover:text-black transition-all">
                           HỌC NGAY <ArrowRight size={10} />
                        </Link>
                      </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-[#0f0f1a] rounded-2xl border border-[#1e293b] border-dashed">
                <p className="text-slate-500 text-sm">Chưa có bài học nào được đăng tải.</p>
              </div>
            )}
          </motion.section>

          {/* Featured Builder Section */}
          <motion.section 
            variants={itemVariants}
            className="group relative bg-gradient-to-br from-[#16213e] to-[#1a1a2e] p-10 rounded-[32px] border border-[#1e293b] overflow-hidden hover:border-[#00d2a0] transition-all"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#00d2a0]/20 text-[#00d2a0] rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Cpu size={14} /> Chế độ lắp ráp
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Thực hành lắp ráp PC 3D</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
                Trải nghiệm cảm giác lắp ráp linh kiện thật ngay trên trình duyệt với sự hỗ trợ của AI Guru.
              </p>
              <div className="flex gap-4">
                <Link href="/builder" className="inline-flex items-center gap-3 px-8 py-4 bg-[#00d2a0] text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,210,160,0.3)] transition-all">
                  Vào phòng Lab <ArrowRight size={20} />
                </Link>
              </div>
            </div>
            {/* Background Icon */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Cpu size={300} />
            </div>
          </motion.section>

          {/* Classes Section */}
          <motion.section variants={itemVariants} className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white">Lớp học của tôi</h2>
              <Link href="/student/classes" className="text-[#00d2a0] text-sm font-bold hover:underline">Xem tất cả</Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#00d2a0]" size={40} />
              </div>
            ) : classes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map((cls: any) => (
                  <Link key={cls.id} href={`/student/classes/${cls.id}`} className="group p-6 rounded-2xl bg-[#0f0f1a] border border-[#1e293b] hover:border-[#00d2a0] transition-all">
                    <div className="flex justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center">
                        <GraduationCap size={24} />
                      </div>
                      <span className="px-3 py-1 bg-[#16213e] rounded-lg text-xs font-bold text-slate-500 uppercase tracking-wider">{cls.code}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#00d2a0] transition-colors">{cls.name}</h3>
                    <p className="text-sm text-slate-500">GV: {cls.profiles?.full_name || 'Đang cập nhật'}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-[#1e293b] rounded-3xl">
                <p className="text-slate-500 mb-6 font-medium">Bạn chưa tham gia lớp học nào.</p>
                <button 
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-3 border border-[#00d2a0] text-[#00d2a0] font-bold rounded-xl hover:bg-[#00d2a0]/10 transition-colors"
                >
                  Nhập mã lớp để tham gia
                </button>
              </div>
            )}
          </motion.section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#00b4d8] to-[#0077b6] p-8 rounded-[32px] text-white shadow-[0_20px_50px_rgba(0,180,216,0.2)]">
            <h3 className="text-2xl font-black mb-4 leading-tight">Thử thách mới mỗi ngày</h3>
            <p className="text-white/80 mb-8 leading-relaxed">
              Hoàn thành các bài tập và thu thập huy hiệu hiếm để leo hạng trên bảng tổng sắp.
            </p>
            <Link href="/lessons" className="block w-full py-4 bg-white text-[#00b4d8] font-bold text-center rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
              Bắt đầu học ngay
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <DailyQuests />
          </motion.div>
        </div>
      </div>

      <JoinClassModal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); fetchData(); }} lang="vn" />
      </motion.div>
    </>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
      className="bg-[#16213e] p-6 rounded-3xl border border-[#1e293b] flex items-center gap-5"
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white" style={{ background: `${color}20`, color: color }}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black text-white leading-none mb-1">{value}</div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</div>
      </div>
    </motion.div>
  );
}
