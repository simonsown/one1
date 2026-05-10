'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, Shield, Activity, Database, 
  Settings, Search, Filter, Loader2, AlertCircle,
  Terminal, Server, Lock
} from 'lucide-react';
import { motion } from 'framer-motion';

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
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(profiles || []);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="animate-spin text-[#00d2a0]" size={48} />
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto px-6 py-10 space-y-10"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 text-red-500 mb-2 font-black uppercase tracking-widest text-[10px] bg-red-500/10 w-fit px-3 py-1 rounded-full border border-red-500/20">
            <Shield size={12} /> Root Administrator
          </div>
          <h1 className="text-4xl font-black text-white">
            Admin <span className="text-[#00d2a0]">Console</span>
          </h1>
        </motion.div>
        
        <motion.div variants={itemVariants} className="flex gap-3">
          <button className="px-5 py-2.5 bg-[#16213e] border border-[#1e293b] text-slate-300 rounded-xl flex items-center gap-2 hover:bg-[#1e293b] transition-colors text-sm font-bold">
            <Terminal size={18} /> Logs
          </button>
          <button className="px-5 py-2.5 bg-[#00d2a0] text-black rounded-xl flex items-center gap-2 hover:shadow-[0_0_20px_rgba(0,210,160,0.4)] transition-all text-sm font-bold">
            <Settings size={18} /> Settings
          </button>
        </motion.div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Users" value={stats.totalUsers} color="#6366f1" />
        <StatCard label="Teachers" value={stats.teachers} color="#06b6d4" />
        <StatCard label="Students" value={stats.students} color="#10b981" />
        <StatCard label="Classes" value={stats.activeClasses} color="#f59e0b" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#16213e] rounded-3xl border border-[#1e293b] overflow-hidden">
          <div className="p-6 border-bottom border-[#1e293b] flex justify-between items-center bg-[#0f0f1a]/50">
             <h3 className="text-xl font-bold text-white">User Management</h3>
             <div className="flex gap-2">
                <div className="relative">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                   <input className="bg-[#0f0f1a] border border-[#1e293b] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#00d2a0] transition-colors w-64" placeholder="Search users..." />
                </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f0f1a]/30 border-b border-[#1e293b] text-slate-500 uppercase font-black text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Identity</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00d2a0] to-[#00b4d8] flex items-center justify-center font-black text-black text-xs uppercase">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.full_name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider
                        ${user.role === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                          user.role === 'teacher' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' : 
                          'bg-green-500/10 text-green-500 border border-green-500/20'}
                       `}>
                        {user.role}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-[#00d2a0] opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs uppercase hover:underline">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* System Health Sidebar */}
        <div className="space-y-6">
           <motion.div variants={itemVariants} className="bg-[#16213e] p-8 rounded-[32px] border border-[#1e293b]">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Server size={18} className="text-[#00d2a0]" /> Infrastructure
              </h3>
              <div className="space-y-6">
                 <HealthItem label="Database Cluster" status="Healthy" percent={98} />
                 <HealthItem label="Compute Nodes" status="Scaling" percent={45} />
                 <HealthItem label="Auth Service" status="Encrypted" percent={100} />
              </div>
           </motion.div>

           <motion.div variants={itemVariants} className="bg-red-500/5 p-8 rounded-[32px] border border-red-500/20">
              <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lock size={16} /> Security Alerts
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed italic">
                "No critical vulnerabilities detected in the last 24 hours. Firewall active."
              </p>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string, value: any, color: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-[#16213e] p-8 rounded-3xl border border-[#1e293b] relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="text-4xl font-black text-white mb-1 leading-none">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2 rounded-full blur-[80px] opacity-20" style={{ background: color }}></div>
    </motion.div>
  );
}

function HealthItem({ label, status, percent }: { label: string, status: string, percent: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-slate-500">{label}</span>
        <span className="text-[#00d2a0]">{status}</span>
      </div>
      <div className="h-1.5 w-full bg-[#0f0f1a] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#00d2a0] to-[#00b4d8]" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  )
}
