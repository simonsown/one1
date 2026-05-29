'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Shield, Activity, Database, 
  Settings, Search, Filter, Loader2, AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    activeClasses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    setLoading(true);
    try {
      // 1. Fetch all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(profiles || []);

      // 2. Calculate stats
      const teachers = profiles?.filter(u => u.role === 'teacher').length || 0;
      const students = profiles?.filter(u => u.role === 'student').length || 0;

      const { count: classesCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: profiles?.length || 0,
        teachers,
        students,
        activeClasses: classesCount || 0
      });

    } catch (err) {
      console.error('Admin Data Error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Loader2 className="animate-spin" color="var(--brand-primary)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>Hệ thống <span style={{ color: 'var(--brand-primary)' }}>Admin Console</span></h1>
          <p style={{ color: '#8899a6', margin: 0 }}>Quản lý người dùng, lớp học và giám sát hoạt động toàn sàn.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Activity size={18} /> Logs hệ thống
          </button>
          <button style={{ padding: '12px 20px', borderRadius: '12px', background: 'var(--brand-primary)', color: '#000', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <Settings size={18} /> Cấu hình
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {[
          { label: 'Tổng người dùng', value: stats.totalUsers, icon: <Users size={20} />, color: '#089e60' },
          { label: 'Giáo viên', value: stats.teachers, icon: <Shield size={20} />, color: '#06b6d4' },
          { label: 'Học sinh', value: stats.students, icon: <Users size={20} />, color: '#10b981' },
          { label: 'Lớp học hoạt động', value: stats.activeClasses, icon: <Database size={20} />, color: '#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(12, 20, 36, 0.8)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', background: `${s.color}15`, color: s.color }}>{s.icon}</div>
              <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 700 }}>+12%</div>
            </div>
            <div style={{ fontSize: '14px', color: '#8899a6', fontWeight: 600, marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#fff' }}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* User Management Table */}
      <div style={{ background: 'rgba(12, 20, 36, 0.8)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0 }}>Quản lý người dùng</h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#4b5563" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              <input placeholder="Tìm kiếm email, tên..." style={{ padding: '10px 16px 10px 40px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px', outline: 'none', width: '250px' }} />
            </div>
            <button style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <Filter size={18} /> Lọc
            </button>
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Người dùng</th>
              <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Vai trò</th>
              <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Trường học</th>
              <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Ngày tham gia</th>
              <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Trạng thái</th>
              <th style={{ padding: '16px 24px', color: '#8899a6', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(45deg, #289cf9, #0066ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                      {user.full_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>{user.full_name}</div>
                      <div style={{ color: '#4b5563', fontSize: '12px' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase',
                    background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : user.role === 'teacher' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: user.role === 'admin' ? '#ef4444' : user.role === 'teacher' ? '#06b6d4' : '#10b981'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', color: '#8899a6', fontSize: '14px' }}>{user.school_id ? 'Đã liên kết' : 'Tự do'}</td>
                <td style={{ padding: '20px 24px', color: '#8899a6', fontSize: '14px' }}>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Online
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <button style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', color: '#8899a6', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#4b5563' }}>
            <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>Không tìm thấy người dùng nào trong hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}
