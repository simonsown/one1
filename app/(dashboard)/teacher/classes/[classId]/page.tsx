'use client';

import React, { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, ClipboardList, Plus, Loader2, ArrowLeft, 
  Settings, UserPlus, Info, Calendar, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import AssignmentCard from '@/components/classes/AssignmentCard';

export default function ClassDetailsPage({ params }: { params: Promise<{ classId: string }> }) {
  const resolvedParams = use(params);
  const classId = resolvedParams.classId;

  const [classData, setClassData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assignments' | 'students'>('assignments');

  useEffect(() => {
    fetchClassInfo();
  }, [classId]);

  async function fetchClassInfo() {
    setLoading(true);
    try {
      // 1. Fetch Class Info
      const { data: cls, error: clsError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();
      
      if (clsError) throw clsError;
      setClassData(cls);

      // 2. Fetch Assignments
      const { data: asgs, error: asgsError } = await supabase
        .from('assignments')
        .select('*, submissions(count)')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });
      
      if (asgsError) throw asgsError;
      setAssignments(asgs || []);

      // 3. Fetch Members (Profiles)
      const { data: mems, error: memsError } = await supabase
        .from('class_members')
        .select(`
          *,
          student:profiles(*)
        `)
        .eq('class_id', classId);
      
      if (memsError) throw memsError;
      setMembers(mems || []);

    } catch (err) {
      console.error('Error fetching class info:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" color="#289cf9" size={48} />
      </div>
    );
  }

  if (!classData) return <div>Không tìm thấy lớp học.</div>;

  return (
    <div style={{ padding: '32px' }}>
      <header style={{ marginBottom: '40px' }}>
        <Link href="/teacher/classes" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#8899a6', textDecoration: 'none', marginBottom: '24px', fontWeight: 600 }}>
          <ArrowLeft size={20} /> Danh sách lớp
        </Link>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '0 0 12px 0', color: '#fff' }}>{classData.name}</h1>
            <div style={{ display: 'flex', gap: '24px', color: '#8899a6', fontSize: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Info size={16} /> Mã lớp: <strong style={{ color: '#289cf9' }}>{classData.code}</strong></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> {members.length}/{classData.max_students} Học sinh</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Năm học: {classData.school_year}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}>
              <Settings size={20} />
            </button>
            <Link href={`/teacher/classes/${classId}/assignments/new`} style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'var(--brand-primary)', color: '#000', border: 'none',
                padding: '12px 24px', borderRadius: '12px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'
              }}>
                <Plus size={20} /> Giao nhiệm vụ
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('assignments')}
          style={{ 
            padding: '12px 0', background: 'none', border: 'none', 
            borderBottom: activeTab === 'assignments' ? '2px solid #289cf9' : '2px solid transparent',
            color: activeTab === 'assignments' ? '#289cf9' : '#8899a6',
            fontSize: '16px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <ClipboardList size={20} /> Nhiệm vụ ({assignments.length})
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          style={{ 
            padding: '12px 0', background: 'none', border: 'none', 
            borderBottom: activeTab === 'students' ? '2px solid #289cf9' : '2px solid transparent',
            color: activeTab === 'students' ? '#289cf9' : '#8899a6',
            fontSize: '16px', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Users size={20} /> Danh sách lớp ({members.length})
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {assignments.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#4b5563' }}>
              <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
              <p>Chưa có nhiệm vụ nào được giao cho lớp này.</p>
            </div>
          ) : (
            assignments.map(asg => (
              <AssignmentCard
                key={asg.id}
                id={asg.id}
                classId={classId}
                title={asg.title}
                type={asg.type}
                deadline={asg.deadline}
                requirements={asg.requirements}
                submittedCount={asg.submissions?.[0]?.count || 0}
                totalMembers={members.length}
                role="teacher"
              />
            ))
          )}
        </div>
      ) : (
        <div style={{ background: 'rgba(12, 20, 36, 0.8)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Họ tên học sinh</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Email</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Ngày tham gia</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Trạng thái</th>
                <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '13px' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {members.map(mem => (
                <tr key={mem.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 24px', color: '#fff', fontWeight: 600 }}>{mem.student?.full_name}</td>
                  <td style={{ padding: '16px 24px', color: '#8899a6' }}>{mem.student?.email}</td>
                  <td style={{ padding: '16px 24px', color: '#8899a6' }}>{new Date(mem.joined_at).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: 700 }}>Hoạt động</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <button style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Xóa khỏi lớp</button>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#4b5563' }}>Lớp học hiện chưa có học sinh nào tham gia.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
