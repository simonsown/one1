'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Search, Database, BookOpen, ChevronRight, 
  Trash2, Edit3, Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import Link from 'next/link';

export default function TeacherQuizBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBankTitle, setNewBankTitle] = useState('');

  useEffect(() => {
    fetchBanks();
  }, []);

  async function fetchBanks() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('question_banks')
        .select('*, questions(count)')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanks(data || []);
    } catch (err) {
      console.error('Error fetching banks:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBank(e: React.FormEvent) {
    e.preventDefault();
    if (!newBankTitle.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('question_banks')
        .insert({
          title: newBankTitle,
          teacher_id: user.id,
          subject: 'Tin học'
        });

      if (error) throw error;
      setNewBankTitle('');
      setShowCreateModal(false);
      fetchBanks();
    } catch (err) {
      alert('Không thể tạo ngân hàng đề thi.');
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Ngân hàng đề thi</h1>
          <p className="text-text-secondary">Quản lý bộ câu hỏi và tạo bài kiểm tra cho học sinh.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-black rounded-xl font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)]"
        >
          <Plus size={20} /> Tạo ngân hàng mới
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 border-brand-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Database size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{banks.length}</div>
              <div className="text-sm text-text-secondary">Ngân hàng đề</div>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6 border-green/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green/10 flex items-center justify-center text-green">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {banks.reduce((acc, b) => acc + (b.questions?.[0]?.count || 0), 0)}
              </div>
              <div className="text-sm text-text-secondary">Tổng số câu hỏi</div>
            </div>
          </div>
        </div>
        <div className="glass-panel p-6 border-purple-500/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">Tin học</div>
              <div className="text-sm text-text-secondary">Chuyên môn chính</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        </div>
      ) : banks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banks.map(bank => (
            <Link key={bank.id} href={`/teacher/quiz-builder/bank/${bank.id}`} className="no-underline">
              <div className="glass-panel p-6 hover:border-brand-primary/50 transition-all group cursor-pointer h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">{bank.title}</h3>
                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 py-1 rounded">
                      {bank.subject}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-text-muted">
                    <span className="flex items-center gap-2"><Database size={14} /> {bank.questions?.[0]?.count || 0} câu hỏi</span>
                    <span className="flex items-center gap-2"><Edit3 size={14} /> Cập nhật {new Date(bank.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center text-text-muted group-hover:bg-brand-primary group-hover:text-black transition-all">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-panel border-dashed border-2 border-border-subtle">
          <Database size={48} className="mx-auto mb-4 text-text-muted opacity-20" />
          <p className="text-text-secondary mb-6">Bạn chưa có ngân hàng đề thi nào.</p>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="text-brand-primary font-bold hover:underline"
          >
            Bắt đầu bằng việc tạo một ngân hàng mới
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-8 border-brand-primary/30 shadow-[0_0_50px_rgba(0,243,255,0.1)]">
            <h2 className="text-2xl font-bold text-white mb-6">Tạo ngân hàng đề mới</h2>
            <form onSubmit={handleCreateBank}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-text-secondary mb-2">Tên ngân hàng đề (VD: Lắp ráp PC cơ bản)</label>
                <input 
                  autoFocus
                  className="w-full bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all"
                  value={newBankTitle}
                  onChange={(e) => setNewBankTitle(e.target.value)}
                  placeholder="Nhập tiêu đề..."
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-4 rounded-xl font-bold text-text-secondary hover:bg-bg-elevated transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-brand-primary text-black rounded-xl font-bold hover:brightness-110 transition-all"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
