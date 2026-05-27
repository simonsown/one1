'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Cpu, ArrowRight, Plus, Loader2, GraduationCap, Bot, Sparkles, Zap, ShieldCheck, Clock, Monitor, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import JoinClassModal from '../../../components/JoinClassModal';
import CareerRecommendation from '../../../components/CareerRecommendation';
import { supabase } from '@/lib/supabase';

const s = { red: '#D32F2F', navy: '#0F2847', teal: '#0D9488', orange: '#F97316' }

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } })

export default function StudentDashboard() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Lớp học', value: '0', icon: <Users size={20} />, color: s.red },
    { label: 'Bài tập', value: '0', icon: <BookOpen size={20} />, color: s.teal },
    { label: 'Linh kiện', value: '45+', icon: <Cpu size={20} />, color: s.orange },
  ]);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: memberships, error: memErr } = await supabase
        .from('class_members').select(`class_id, classes:class_id (id, name, code, subject, teacher_id, profiles:teacher_id (full_name))`).eq('student_id', user.id);
      if (memErr) throw memErr;
      const joinedClasses = memberships?.map((m: any) => { const cls = m.classes; if (cls && Array.isArray(cls.profiles)) cls.profiles = cls.profiles[0]; return cls; }) || [];
      setClasses(joinedClasses);
      const classIds = joinedClasses.map((c: any) => c.id);
      let assignmentCount = 0;
      if (classIds.length > 0) { const { count } = await supabase.from('assignments').select('*', { count: 'exact', head: true }).in('class_id', classIds).eq('is_published', true); assignmentCount = count || 0; }
      setStats([
        { label: 'Lớp học', value: joinedClasses.length.toString(), icon: <Users size={20} />, color: s.teal },
        { label: 'Bài tập', value: assignmentCount.toString(), icon: <BookOpen size={20} />, color: s.red },
        { label: 'Linh kiện', value: '45+', icon: <Cpu size={20} />, color: s.orange },
      ]);
    } catch (err) { console.error('Error fetching student data:', err); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ margin: 0 }}>
      <motion.header {...fadeUp(0)} style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: s.navy, marginBottom: '4px' }}>Xin chào! 👋</h1>
          <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>Chào mừng bạn quay trở lại với không gian học tập PC Master.</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowJoinModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: s.navy, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(15,40,71,0.2)' }}>
          <Plus size={16} /> Tham gia lớp học
        </motion.button>
      </motion.header>

      <motion.div {...fadeUp(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -4 }}
            style={{ padding: '24px 24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.25s, transform 0.25s' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${stat.color}0d`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.navy, lineHeight: 1.2 }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 500 }}>{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div {...fadeUp(0.2)}
            style={{ padding: '28px 32px', position: 'relative', overflow: 'hidden', borderRadius: '16px', background: `linear-gradient(135deg, ${s.navy} 0%, #0F2A44 100%)`, border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 4px 20px rgba(15,40,71,0.15)' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Monitor size={18} color={s.orange} />
                <span style={{ color: s.orange, fontSize: '12px', fontWeight: 700, letterSpacing: '1px' }}>PHÒNG LAB 2D</span>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>Thực hành lắp ráp PC</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px', maxWidth: '360px', fontSize: '13px', lineHeight: 1.6 }}>
                Lắp ráp linh kiện, kiểm tra tương thích, tính TDP realtime — tất cả trong phòng Lab 2D trực quan.
              </p>
              <Link href="/builder">
                <button style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', background: s.orange, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}>
                  Bắt đầu thực hành <ArrowRight size={14} />
                </button>
              </Link>
            </div>
            <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.06 }}>
              <Cpu size={180} color="#fff" />
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.3)} style={{ padding: '24px 28px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: s.navy }}>Lớp học của tôi</h2>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{classes.length} lớp</span>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 size={28} style={{ color: s.red, animation: 'spin 1s linear infinite' }} /></div>
            ) : classes.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {classes.map((cls, idx) => (
                  <motion.div key={cls.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + idx * 0.05 }}>
                    <Link href={`/student/classes/${cls.id}`} style={{ textDecoration: 'none' }}>
                      <motion.div whileHover={{ y: -3 }}
                        style={{ padding: '16px', cursor: 'pointer', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', boxShadow: '0 1px 2px rgba(0,0,0,0.03)', transition: 'box-shadow 0.25s, transform 0.25s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: `${s.teal}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <GraduationCap size={16} color={s.teal} />
                          </div>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#E2E8F0', color: '#64748B', fontWeight: 600 }}>{cls.code}</span>
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, color: s.navy, marginBottom: '2px', margin: 0 }}>{cls.name}</h3>
                        <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>GV: {cls.profiles?.full_name || 'Đang cập nhật'}</p>
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 0', border: '2px dashed #E2E8F0', borderRadius: '14px' }}>
                <p style={{ color: '#64748B', marginBottom: '12px', fontSize: '13px' }}>Bạn chưa tham gia lớp học nào.</p>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowJoinModal(true)}
                  style={{ background: 'transparent', border: `1px solid ${s.navy}`, color: s.navy, padding: '8px 20px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', transition: 'all 0.2s' }}>
                  Nhập mã lớp để tham gia
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <motion.div {...fadeUp(0.25)}
            style={{ padding: '24px', background: `linear-gradient(135deg, ${s.navy} 0%, #0A2342 100%)`, color: '#fff', position: 'relative', overflow: 'hidden', borderRadius: '14px', boxShadow: '0 4px 20px rgba(15,40,71,0.15)' }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Bot size={32} style={{ marginBottom: '12px', opacity: 0.9 }} />
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px', color: '#fff' }}>AI Guru</h3>
              <p style={{ fontSize: '13px', opacity: 0.85, marginBottom: '20px', lineHeight: 1.6 }}>Gặp khó khăn? Chat với AI để được tư vấn chi tiết từng linh kiện.</p>
              <Link href="/builder">
                <button style={{ display: 'block', textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', fontSize: '13px', border: '1px solid rgba(255,255,255,0.2)', width: '100%', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.8)'; e.currentTarget.style.borderColor = 'transparent'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}>
                  Bắt đầu trò chuyện
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.35)} style={{ padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px', color: s.navy }}>Thông báo mới</h3>
            <div style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', padding: '16px 0' }}>
              Chưa có thông báo nào từ giáo viên.
            </div>
          </motion.div>
        </aside>
      </div>

      <CareerRecommendation lang="vn" />

      <JoinClassModal isOpen={showJoinModal} onClose={() => { setShowJoinModal(false); fetchData(); }} lang="vn" />

      <Link href="/builder" style={{
        position: 'fixed', bottom: '32px', right: '32px', width: '54px', height: '54px', borderRadius: '50%',
        background: `linear-gradient(135deg, ${s.orange}, #ea580c)`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 20px rgba(249,115,22,0.35)', cursor: 'pointer', zIndex: 100, textDecoration: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(249,115,22,0.45)'; }}
         onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(249,115,22,0.35)'; }}>
        <Bot size={24} color="#fff" />
      </Link>
    </div>
  )
}
