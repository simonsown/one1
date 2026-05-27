'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, FileText, BookOpen, GraduationCap, TrendingUp, ArrowRight, Loader2, Plus, Monitor, Award, MessageSquare } from 'lucide-react';
import Link from 'next/link';

const s = { red: '#D32F2F', navy: '#0F2847', teal: '#0D9488', orange: '#F97316' }

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ classes: 0, students: 0, assignments: 0, submissions: 0 });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: classesData, count: classesCount } = await supabase.from('classes').select('*', { count: 'exact' }).eq('teacher_id', user.id);
      setClasses(classesData || []);
      const classIds = classesData?.map(c => c.id) || [];
      const { count: studentsCount } = await supabase.from('class_members').select('*', { count: 'exact', head: true }).in('class_id', classIds);
      const { count: asgCount } = await supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id);
      setStats({ classes: classesCount || 0, students: studentsCount || 0, assignments: asgCount || 0, submissions: 0 });
    } catch (err) { console.error('Error fetching teacher stats:', err); }
    finally { setLoading(false); }
  }

  const quickActions = [
    { title: 'Lớp học', desc: 'Tạo mã lớp, quản lý thành viên', icon: <Users size={22} />, color: s.teal, href: '/teacher/classes' },
    { title: 'Bài giảng', desc: 'Soạn thảo nội dung học tập', icon: <FileText size={22} />, color: s.red, href: '/teacher/lessons' },
    { title: 'Sách giáo khoa', desc: 'Nội dung số theo chương trình GDPT', icon: <BookOpen size={22} />, color: s.navy, href: '/teacher/lessons' },
    { title: 'Kiến thức mở rộng', desc: 'Thư viện phần cứng & công nghệ mới', icon: <Monitor size={22} />, color: s.orange, href: '/teacher/lessons' },
  ];

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 size={36} style={{ color: s.red, animation: 'spin 1s linear infinite' }} /></div>

  return (
    <div style={{ margin: 0 }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: s.navy, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Chào mừng Thầy/Cô!</h1>
        <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>Hôm nay Thầy/Cô muốn thực hiện công việc gì?</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '36px' }}>
        {[
          { label: 'Số lớp đang quản lý', value: stats.classes, icon: <GraduationCap size={20} />, color: s.teal },
          { label: 'Tổng số học sinh', value: stats.students, icon: <Users size={20} />, color: s.red },
          { label: 'Nhiệm vụ đã giao', value: stats.assignments, icon: <BookOpen size={20} />, color: s.orange },
        ].map((st, i) => (
          <div key={i} style={{ padding: '24px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.25s, transform 0.25s' }}
            onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${st.color}0d`, color: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {st.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.navy }}>{st.value}</div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>{st.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '28px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: s.navy, marginBottom: '14px' }}>Thao tác nhanh</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '28px' }}>
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.href} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'all 0.25s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = action.color; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${action.color}0d`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {action.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: s.navy, fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>{action.title}</div>
                    <div style={{ color: '#64748B', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action.desc}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: '#94A3B8', flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: s.navy, margin: 0 }}>Lớp của tôi</h2>
            <Link href="/teacher/classes/new" style={{ color: s.orange, fontSize: '12px', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={14} /> Tạo mới
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {classes.length > 0 ? classes.map(cls => (
              <div key={cls.id} style={{ padding: '16px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'box-shadow 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                onMouseOut={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: s.navy }}>{cls.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>{cls.subject}{cls.grade ? ` • Khối ${cls.grade}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', color: s.orange, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Mã lớp</div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: s.navy, fontFamily: 'monospace' }}>{cls.code}</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '28px', textAlign: 'center', border: '2px dashed #E2E8F0', borderRadius: '12px', color: '#64748B', fontSize: '13px' }}>
                Chưa có lớp học nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
