'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Cpu, ArrowRight, Plus, Loader2, GraduationCap } from 'lucide-react';
import JoinClassModal from '../../../components/JoinClassModal';
import { supabase } from '@/lib/supabase';

export default function StudentDashboard() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Lớp học', value: '0', icon: <Users size={20} />, color: '#06b6d4' },
    { label: 'Bài tập', value: '0', icon: <BookOpen size={20} />, color: '#10b981' },
    { label: 'Linh kiện', value: '45+', icon: <Cpu size={20} />, color: '#8b5cf6' },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch joined classes
      const { data: memberships, error: memErr } = await supabase
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

      if (memErr) throw memErr;

      const joinedClasses = memberships?.map((m: any) => {
        const cls = m.classes;
        if (cls && Array.isArray(cls.profiles)) {
          cls.profiles = cls.profiles[0];
        }
        return cls;
      }) || [];
      setClasses(joinedClasses);

      // 2. Fetch assignments count
      const classIds = joinedClasses.map((c: any) => c.id);
      let assignmentCount = 0;
      if (classIds.length > 0) {
        const { count } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .in('class_id', classIds)
          .eq('is_published', true);
        assignmentCount = count || 0;
      }

      setStats([
        { label: 'Lớp học', value: joinedClasses.length.toString(), icon: <Users size={20} />, color: '#06b6d4' },
        { label: 'Bài tập', value: assignmentCount.toString(), icon: <BookOpen size={20} />, color: '#10b981' },
        { label: 'Linh kiện', value: '45+', icon: <Cpu size={20} />, color: '#8b5cf6' },
      ]);

    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>Xin chào 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Chào mừng bạn quay trở lại với không gian học tập PC Master.</p>
        </div>
        <button 
          onClick={() => setShowJoinModal(true)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', 
            background: 'var(--brand-primary)', color: '#000', borderRadius: '12px', 
            fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} /> Tham gia lớp học
        </button>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '20px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '32px' }}>
        {/* Main Section */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-subtle)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>Phòng thực hành PC Builder</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px' }}>
                Tự tay lắp ráp các cấu hình máy tính hiện đại, kiểm tra sự tương thích và hiệu năng của linh kiện ngay lập tức.
              </p>
              <Link href="/builder" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'var(--brand-primary)', color: '#000', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                Bắt đầu thực hành <ArrowRight size={18} />
              </Link>
            </div>
            <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
              <Cpu size={200} color="var(--brand-primary)" />
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Lớp học của tôi</h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{classes.length} lớp học</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                <Loader2 className="animate-spin" color="var(--brand-primary)" />
              </div>
            ) : classes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {classes.map((cls) => (
                  <Link key={cls.id} href={`/student/classes/${cls.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ 
                      padding: '24px', borderRadius: '20px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                      transition: 'all 0.2s', cursor: 'pointer'
                    }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--brand-primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <GraduationCap size={20} color="#06b6d4" />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand-primary)', background: 'rgba(0, 243, 255, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                          {cls.code}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{cls.name}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>GV: {cls.profiles?.full_name || 'Đang cập nhật'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed var(--border-subtle)', borderRadius: '16px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Bạn chưa tham gia lớp học nào.</p>
                <button 
                  onClick={() => setShowJoinModal(true)}
                  style={{ background: 'transparent', border: '1px solid var(--brand-primary)', color: 'var(--brand-primary)', padding: '8px 20px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Nhập mã lớp để tham gia
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Sidebar Section */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', padding: '32px', borderRadius: '24px', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>AI Guru đang chờ</h3>
              <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '24px', lineHeight: 1.5 }}>Bạn gặp khó khăn khi chọn linh kiện hay cấu hình máy tính? Chat ngay với chuyên gia AI của chúng tôi để nhận tư vấn chuyên sâu.</p>
              <Link href="/builder" style={{ display: 'block', textAlign: 'center', padding: '14px', background: 'white', color: '#06b6d4', borderRadius: '12px', fontWeight: 700, textDecoration: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                Bắt đầu trò chuyện
              </Link>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Thông báo mới</h3>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              Hiện chưa có thông báo nào từ giáo viên.
            </div>
          </div>
        </aside>
      </div>

      <JoinClassModal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); fetchData(); }} lang="vn" />

      {/* Floating AI Guru Button */}
      <Link href="/builder" style={{ 
        position: 'fixed', bottom: '30px', right: '30px', 
        width: '60px', height: '60px', borderRadius: '50%', 
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 10px 25px rgba(6, 182, 212, 0.4)',
        cursor: 'pointer', zIndex: 100, textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}>
        <span style={{ fontSize: '24px' }}>✨</span>
        <div style={{ 
          position: 'absolute', right: '70px', background: 'var(--bg-surface)', 
          padding: '8px 16px', borderRadius: '12px', border: '1px solid var(--border-subtle)',
          whiteSpace: 'nowrap', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
        }}>
          Hỏi AI Guru ngay!
        </div>
      </Link>
    </div>
  )
}
