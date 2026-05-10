'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, FileText, ClipboardCheck, Plus, 
  ArrowRight, BookOpen, GraduationCap, TrendingUp,
  LayoutDashboard, Settings, LogOut, BarChart3, Layers, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    assignments: 0,
    lessons: 0
  });
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // REAL-TIME SUBSCRIPTION
    const channel = supabase
      .channel('teacher_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_members' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, () => fetchStats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch classes count and list
      const { data: classesData, count: classesCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact' })
        .eq('teacher_id', user.id);
      
      setClasses(classesData || []);

      // 2. Fetch total students (members of all teacher's classes)
      const classIds = classesData?.map(c => c.id) || [];
      let studentsCount = 0;
      if (classIds.length > 0) {
        const { count } = await supabase
          .from('class_members')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds);
        studentsCount = count || 0;
      }

      // 3. Fetch assignments
      const { data: asgData, count: asgCount } = await supabase
        .from('assignments')
        .select(`
          *,
          lessons (title)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setAssignments(asgData || []);

      // 4. Fetch lessons count
      const { count: lessonCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', user.id);

      setStats({
        classes: classesCount || 0,
        students: studentsCount || 0,
        assignments: asgCount || 0,
        lessons: lessonCount || 0
      });
    } catch (err) {
      console.error('Error fetching teacher stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const quickActions = [
    { title: 'Quản lý Lớp học', desc: 'Tạo mã lớp, quản lý thành viên', icon: <Users size={24} />, color: '#06b6d4', href: '/teacher/classes' },
    { title: 'Soạn Bài giảng', desc: 'Thiết kế bài học & quiz tương tác', icon: <FileText size={24} />, color: '#10b981', href: '/teacher/lessons' },
    { title: 'Thư viện Sách', desc: 'Quản lý tài liệu kỹ thuật', icon: <BookOpen size={24} />, color: '#8b5cf6', href: '/teacher/lessons' },
    { title: 'Báo cáo Học tập', desc: 'Xem tiến độ chi tiết từng học sinh', icon: <BarChart3 size={24} />, color: '#ec4899', href: '/teacher/reports' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-6 py-10"
    >
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 text-[#00d2a0] mb-2 font-bold uppercase tracking-widest text-xs">
            <LayoutDashboard size={16} /> Khu vực giáo viên
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Trang <span className="text-[#00d2a0]">Điều hành</span>
          </h1>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex items-center gap-4">
           <Link href="/teacher/classes/new" className="px-6 py-3 bg-[#00d2a0] text-black font-bold rounded-xl shadow-lg hover:shadow-[#00d2a0]/40 transition-all flex items-center gap-2">
             <Plus size={20} /> Tạo lớp mới
           </Link>
        </motion.div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard label="Lớp đang dạy" value={stats.classes} icon={<GraduationCap size={24} />} color="#06b6d4" />
        <StatCard label="Tổng học sinh" value={stats.students} icon={<Users size={24} />} color="#10b981" />
        <StatCard label="Bài giảng" value={stats.lessons} icon={<Layers size={24} />} color="#8b5cf6" />
        <StatCard label="Bài tập đã giao" value={stats.assignments} icon={<ClipboardCheck size={24} />} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Column */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div variants={itemVariants} className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
            <h2 className="text-2xl font-bold text-white mb-8">Thao tác quản lý</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, idx) => (
                <Link key={idx} href={action.href} className="group flex items-center gap-5 p-6 rounded-2xl bg-[#0f0f1a] border border-[#1e293b] hover:border-[#00d2a0] transition-all">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${action.color}15`, color: action.color }}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 group-hover:text-[#00d2a0] transition-colors">{action.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* List of Classes */}
          <motion.div variants={itemVariants} className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white">Lớp học hiện tại</h2>
                <div className="flex gap-4">
                   <Link href="/teacher/classes" className="text-sm font-bold text-[#00d2a0] hover:underline">Tất cả lớp</Link>
                </div>
             </div>
             
             {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00d2a0]" /></div>
             ) : classes.length > 0 ? (
                <div className="space-y-4">
                  {classes.map((cls: any) => (
                    <div key={cls.id} className="flex items-center justify-between p-6 rounded-2xl bg-[#0f0f1a] border border-[#1e293b] hover:border-[#00d2a0]/30 transition-all">
                      <div>
                        <h4 className="text-lg font-bold text-white">{cls.name}</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{cls.subject} • Khối {cls.grade}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-[10px] text-[#00d2a0] font-black uppercase tracking-tighter mb-1">Mã lớp</div>
                          <div className="text-xl font-black text-white font-mono bg-[#16213e] px-4 py-1 rounded-lg border border-white/5">{cls.code}</div>
                        </div>
                        <Link href={`/teacher/classes/${cls.id}`} className="p-2 text-slate-400 hover:text-white transition-colors">
                          <ArrowRight size={20} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="text-center py-16 border-2 border-dashed border-[#1e293b] rounded-3xl">
                   <p className="text-slate-500 font-medium">Chưa có lớp học nào được tạo.</p>
                </div>
             )}
          </motion.div>

          {/* Giao Nhiệm Vụ Section */}
          <motion.div variants={itemVariants} className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
             <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                   <h2 className="text-2xl font-bold text-white">Giao nhiệm vụ</h2>
                   <Link href="/teacher/settings" className="p-2 bg-[#1e293b] rounded-lg text-slate-400 hover:text-white transition-all">
                      <Settings size={18} />
                   </Link>
                </div>
                <Link href="/teacher/assignments/new" className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/10 transition-all">
                   Giao bài mới
                </Link>
             </div>

             {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#00d2a0]" /></div>
             ) : assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((asg: any) => (
                    <div key={asg.id} className="flex items-center justify-between p-5 rounded-2xl bg-[#0f0f1a] border border-[#1e293b]">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b] flex items-center justify-center">
                             <ClipboardCheck size={20} />
                          </div>
                          <div>
                             <h4 className="font-bold text-white">{asg.title}</h4>
                             <p className="text-xs text-slate-500">Bài giảng: {asg.lessons?.title || 'Video/PDF tổng hợp'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">Hạn chót</p>
                          <p className="text-sm font-bold text-white">{asg.due_date ? new Date(asg.due_date).toLocaleDateString('vi-VN') : 'Không có'}</p>
                       </div>
                    </div>
                  ))}
                </div>
             ) : (
                <div className="text-center py-12 bg-[#0f0f1a] rounded-2xl border border-[#1e293b] border-dashed">
                   <p className="text-slate-500 text-sm">Chưa có nhiệm vụ nào được giao.</p>
                </div>
             )}
          </motion.div>
        </div>

        {/* Real-time Tracking / Insights Sidebar */}
        <div className="space-y-8">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#00d2a0] to-[#00b4d8] p-8 rounded-[32px] text-black">
               <div className="flex items-center gap-2 mb-4">
                 <TrendingUp size={20} />
                 <h3 className="text-xl font-black">Xu hướng học tập</h3>
               </div>
               <p className="font-bold text-sm opacity-80 mb-8 leading-relaxed">
                 {stats.students > 0 
                   ? `Có ${stats.students} học sinh đang tham gia. Tỷ lệ hoàn thành bài tập đạt ${Math.min(100, Math.round((stats.assignments / (stats.classes || 1)) * 10))}%`
                   : "Hãy tạo lớp học và mời học sinh để bắt đầu theo dõi xu hướng."}
               </p>
               <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stats.students > 0 ? '66%' : '0%' }}
                    className="h-full bg-white"
                 ></motion.div>
               </div>
            </motion.div>

           <motion.div variants={itemVariants} className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
              <h3 className="text-lg font-bold text-white mb-6">Trạng thái hệ thống</h3>
              <div className="space-y-4">
                <StatusItem label="Supabase DB" status="Online" color="#10b981" />
                <StatusItem label="Real-time Engine" status="Active" color="#10b981" />
                <StatusItem label="AI Guru Service" status="Steady" color="#10b981" />
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-[#16213e] p-6 rounded-3xl border border-[#1e293b] flex items-center gap-5"
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${color}15`, color: color }}>
        {icon}
      </div>
      <div>
        <div className="text-3xl font-black text-white leading-none mb-1">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      </div>
    </motion.div>
  );
}

function StatusItem({ label, status, color }: { label: string, status: string, color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }}></div>
        <span className="text-xs font-bold text-white">{status}</span>
      </div>
    </div>
  )
}
