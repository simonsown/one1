'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';
import { 
  Users, Award, BookOpen, Download, Filter, 
  TrendingUp, AlertCircle, Search, ChevronRight 
} from 'lucide-react';
import ExportReportButton from '@/components/dashboard/ExportReportButton';

export default function TeacherReportingPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [classData, setClassData] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);

  useEffect(() => {
    fetchReportingData();
  }, []);

  async function fetchReportingData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Lấy dữ liệu lớp học
      const { data: classes } = await supabase
        .from('classes')
        .select('*, class_members(count)')
        .eq('teacher_id', user.id);

      // 2. Lấy dữ liệu thống kê từ View (đã tạo ở bước SQL)
      const { data: classStats } = await supabase
        .from('teacher_class_stats')
        .select('*');

      // 3. Lấy Top học sinh xuất sắc
      const { data: studentPerformance } = await supabase
        .from('quiz_attempts')
        .select(`
          score,
          student:profiles(id, full_name, avatar_url)
        `)
        .order('score', { ascending: false })
        .limit(5);

      setClassData(classStats || []);
      setTopStudents(studentPerformance || []);
      
      // Tổng hợp stats nhanh
      setStats({
        totalClasses: classes?.length || 0,
        totalStudents: classes?.reduce((acc, c) => acc + (c.class_members?.[0]?.count || 0), 0),
        avgScore: classStats?.reduce((acc, c) => acc + c.avg_quiz_score, 0) / (classStats?.length || 1)
      });

    } catch (err) {
      console.error('Error fetching reporting data:', err);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ['#00f3ff', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Báo cáo & Thống kê</h1>
          <p className="text-text-secondary italic">Phân tích dữ liệu học tập để tối ưu hóa giảng dạy.</p>
        </div>
        <div className="flex gap-4">
          <ExportReportButton data={classData} filename="Class_Performance_Report" />
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <StatWidget label="Tổng số lớp" value={stats?.totalClasses || 0} icon={<BookOpen />} color="#00f3ff" />
        <StatWidget label="Tổng học sinh" value={stats?.totalStudents || 0} icon={<Users />} color="#3b82f6" />
        <StatWidget label="Điểm trung bình" value={Math.round(stats?.avgScore || 0) + '%'} icon={<TrendingUp />} color="#8b5cf6" />
        <StatWidget label="Tỷ lệ hoàn thành" value="84%" icon={<Award />} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Performance by Class */}
        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <TrendingUp className="text-brand-primary" /> Hiệu suất theo lớp học
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="class_name" stroke="#8899a6" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8899a6" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0a0f1a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="avg_quiz_score" radius={[8, 8, 0, 0]}>
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Students Ranking */}
        <div className="glass-panel p-8">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            <Award className="text-warning" /> Bảng xếp hạng học sinh
          </h3>
          <div className="space-y-4">
            {topStudents.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-all">
                <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center font-black text-brand-primary">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white">{item.student?.full_name || 'Học sinh ẩn danh'}</p>
                  <p className="text-xs text-text-muted">Đã hoàn thành 12 bài học</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-brand-primary">{item.score}đ</div>
                  <div className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">Tổng điểm</div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-4 bg-bg-elevated text-text-primary rounded-xl font-bold hover:bg-bg-hover transition-all text-sm uppercase tracking-widest">
            Xem tất cả bảng xếp hạng
          </button>
        </div>
      </div>

      {/* Detailed Table Placeholder */}
      <div className="glass-panel overflow-hidden border-border-subtle">
        <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-white/5">
          <h3 className="font-bold text-white">Chi tiết điểm số theo lớp</h3>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                placeholder="Tìm lớp học..." 
                className="bg-bg-base border border-border-default rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-brand-primary"
              />
            </div>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-bg-elevated text-text-muted text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Tên lớp</th>
              <th className="px-6 py-4">Sĩ số</th>
              <th className="px-6 py-4">Điểm TB</th>
              <th className="px-6 py-4">Số bài đã nộp</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {classData.map((c, i) => (
              <tr key={i} className="hover:bg-white/5 transition-all">
                <td className="px-6 py-4 font-bold text-white">{c.class_name}</td>
                <td className="px-6 py-4 text-text-secondary">{c.total_students} học sinh</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-bg-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary" style={{ width: `${c.avg_quiz_score * 10}%` }}></div>
                    </div>
                    <span className="font-bold text-brand-primary">{Math.round(c.avg_quiz_score)}đ</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-secondary">{c.total_submissions} bài</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-text-muted hover:text-white transition-all"><ChevronRight /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatWidget({ label, value, icon, color }: any) {
  return (
    <div className="glass-panel p-6 border-l-4 relative overflow-hidden group" style={{ borderLeftColor: color }}>
      <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:scale-110 transition-transform duration-500">
        {React.cloneElement(icon as React.ReactElement, { size: 100 } as any)}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20`, color }}>
            {React.cloneElement(icon as React.ReactElement, { size: 20 } as any)}
          </div>
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-3xl font-black text-white">{value}</div>
      </div>
    </div>
  );
}
