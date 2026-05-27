'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import ClassCard from '@/components/classes/ClassCard';
import { Plus, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          class_members(count),
          assignments(count)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" color="#00f3ff" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>Quản lý <span style={{ color: '#00f3ff' }}>Lớp học</span></h1>
          <p style={{ color: '#8899a6', margin: 0 }}>Tạo lớp, quản lý học sinh và giao nhiệm vụ lắp ráp PC.</p>
        </div>
        <Link href="/teacher/classes/new" style={{ textDecoration: 'none' }}>
          <button style={{
            background: 'var(--brand-primary)', color: '#000', border: 'none',
            padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={20} /> Tạo lớp mới
          </button>
        </Link>
      </header>

      {classes.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '100px 0',
          background: 'rgba(12, 20, 36, 0.5)', borderRadius: '24px',
          border: '2px dashed rgba(255,255,255,0.05)'
        }}>
          <BookOpen size={64} color="#1e293b" style={{ marginBottom: '24px' }} />
          <h3 style={{ color: '#8899a6', margin: '0 0 24px 0' }}>Bạn chưa tạo lớp học nào.</h3>
          <Link href="/teacher/classes/new" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', border: '1px solid #00f3ff',
              padding: '12px 32px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'
            }}>
              Tạo lớp ngay
            </button>
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {classes.map(cls => (
            <ClassCard
              key={cls.id}
              id={cls.id}
              name={cls.name}
              code={cls.code}
              memberCount={cls.class_members?.[0]?.count || 0}
              maxStudents={cls.max_students}
              activeAssignmentsCount={cls.assignments?.[0]?.count || 0}
              role="teacher"
            />
          ))}
        </div>
      )}
    </div>
  );
}
