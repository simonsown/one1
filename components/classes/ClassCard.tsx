'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Monitor, ChevronRight } from 'lucide-react';

interface ClassCardProps {
  id: string;
  name: string;
  code: string;
  teacherName?: string;
  memberCount: number;
  maxStudents: number;
  activeAssignmentsCount: number;
  role: 'teacher' | 'student';
}

export default function ClassCard({ id, name, code, teacherName, memberCount, maxStudents, activeAssignmentsCount, role }: ClassCardProps) {
  const linkHref = `/${role}/classes/${id}`;

  return (
    <div style={{
      background: 'rgba(12, 20, 36, 0.8)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ padding: '20px', background: 'rgba(0, 243, 255, 0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 243, 255, 0.1)', color: '#289cf9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Monitor size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#fff' }}>{name}</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#8899a6', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Mã: <strong style={{ color: '#289cf9', letterSpacing: '1px' }}>{code}</strong></span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> {memberCount}/{maxStudents}</span>
          </p>
          {teacherName && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4b5563' }}>GV: {teacherName}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeAssignmentsCount > 0 ? '#10b981' : '#4b5563' }}></div>
          <span style={{ fontSize: '14px', color: '#e0e6ed', fontWeight: 600 }}>
            {activeAssignmentsCount > 0 ? `${activeAssignmentsCount} nhiệm vụ đang mở` : 'Không có nhiệm vụ mới'}
          </span>
        </div>

        <Link href={linkHref} style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)'; e.currentTarget.style.color = '#289cf9'; e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.3)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            Vào lớp <ChevronRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
}
