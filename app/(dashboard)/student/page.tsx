'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Cpu, ArrowRight, Plus, Loader2, GraduationCap, Award, CheckCircle, TrendingUp } from 'lucide-react';
import JoinClassModal from '../../../components/JoinClassModal';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [profile, setProfile] = useState<any>(null);
  const [progressCount, setProgressCount] = useState(0);
  const [assignmentCount, setAssignmentCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
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
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Chào mừng, <span className="text-[#00d2a0]">{profile?.full_name?.split(' ')[0] || 'Học viên'}!</span> 👋
          </h1>
          <p className="text-slate-400 text-lg">Hôm nay bạn muốn học thêm điều gì mới về máy tính?</p>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Lớp học" value={classes.length} icon={<Users size={24} />} color="#06b6d4" />
        <StatCard label="Bài học hoàn thành" value={progressCount} icon={<CheckCircle size={24} />} color="#10b981" />
        <StatCard label="Bài tập" value={assignmentCount} icon={<BookOpen size={24} />} color="#f59e0b" />
        <StatCard label="Điểm tích lũy (XP)" value={profile?.xp || 0} icon={<Award size={24} />} color="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Builder Section */}
          <motion.section 
            variants={itemVariants}
            className="group relative bg-[#16213e] p-10 rounded-[32px] border border-[#1e293b] overflow-hidden hover:border-[#00d2a0] transition-all"
          >
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-[#00d2a0]/20 text-[#00d2a0] rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Cpu size={14} /> Chế độ lắp ráp
              </div>
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">Thực hành lắp ráp PC 3D</h2>
              <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
                Trải nghiệm cảm giác lắp ráp linh kiện thật ngay trên trình duyệt với sự hỗ trợ của AI Guru.
              </p>
              <Link href="/builder" className="inline-flex items-center gap-3 px-8 py-4 bg-[#00d2a0] text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,210,160,0.3)] transition-all">
                Vào phòng Lab <ArrowRight size={20} />
              </Link>
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

          <motion.div variants={itemVariants} className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={20} className="text-[#00d2a0]" />
              <h3 className="text-lg font-bold">Hoạt động gần đây</h3>
            </div>
            <div className="space-y-6">
              <div className="text-center py-10">
                <p className="text-slate-500 text-sm italic font-medium">Chưa có thông báo mới.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <JoinClassModal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); fetchData(); }} lang="vn" />
    </motion.div>
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
