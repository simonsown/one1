'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus, Trash2, Edit3, Save, X, ChevronLeft, 
  CheckCircle2, AlertCircle, HelpCircle, Layout, Loader2, ClipboardList
} from 'lucide-react';
import Link from 'next/link';

export default function QuestionBankDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bankId = resolvedParams.id;

  const [bank, setBank] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  useEffect(() => {
    fetchBankDetails();
  }, [bankId]);

  async function fetchBankDetails() {
    try {
      // 1. Fetch Bank Info
      const { data: bankData } = await supabase
        .from('question_banks')
        .select('*')
        .eq('id', bankId)
        .single();
      setBank(bankData);

      // 2. Fetch Questions & Options
      const { data: questionsData } = await supabase
        .from('questions')
        .select(`
          *,
          options:question_options (*)
        `)
        .eq('bank_id', bankId)
        .order('order', { ascending: true });

      setQuestions(questionsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteQuestion(id: string) {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    try {
      await supabase.from('questions').delete().eq('id', id);
      fetchBankDetails();
    } catch (err) {
      alert('Lỗi khi xóa câu hỏi');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/teacher/quiz-builder" className="flex items-center gap-2 text-text-muted hover:text-white mb-8 transition-colors">
        <ChevronLeft size={20} /> Quay lại danh sách ngân hàng
      </Link>

      <header className="flex justify-between items-end mb-12">
        <div>
          <div className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-2">Quản lý câu hỏi</div>
          <h1 className="text-4xl font-black text-white">{bank?.title}</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowQuizModal(true)}
            className="px-6 py-3 bg-bg-elevated border border-border-default text-text-primary rounded-xl font-bold flex items-center gap-2 hover:bg-bg-hover transition-all"
          >
            <ClipboardList size={20} /> Tạo bài kiểm tra
          </button>
          <button 
            onClick={() => {
              setEditingQuestion({
                content: '',
                type: 'multiple_choice',
                points: 1,
                options: [
                  { content: '', is_correct: false },
                  { content: '', is_correct: false },
                  { content: '', is_correct: false },
                  { content: '', is_correct: false }
                ]
              });
              setShowAddModal(true);
            }}
            className="px-6 py-3 bg-brand-primary text-black rounded-xl font-bold flex items-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)]"
          >
            <Plus size={20} /> Thêm câu hỏi
          </button>
        </div>
      </header>

      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="text-center py-20 glass-panel border-dashed border-2 border-border-subtle">
            <HelpCircle size={48} className="mx-auto mb-4 text-text-muted opacity-20" />
            <p className="text-text-secondary">Ngân hàng đề này chưa có câu hỏi nào.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="glass-panel p-6 group relative overflow-hidden border-border-subtle hover:border-brand-primary/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center text-sm font-bold text-brand-primary">
                    {idx + 1}
                  </span>
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {q.type.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 bg-brand-primary/10 rounded text-[10px] font-bold text-brand-primary uppercase tracking-wider">
                    {q.points} Điểm
                  </span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingQuestion(JSON.parse(JSON.stringify(q)));
                      setShowAddModal(true);
                    }}
                    className="p-2 rounded-lg bg-bg-elevated text-text-muted hover:text-brand-primary transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-2 rounded-lg bg-bg-elevated text-text-muted hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-6 leading-relaxed">{q.content}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {q.options?.map((opt: any) => (
                  <div 
                    key={opt.id} 
                    className={`p-4 rounded-xl border flex items-center gap-3 ${
                      opt.is_correct 
                        ? 'bg-green/10 border-green/30 text-green' 
                        : 'bg-bg-elevated/50 border-white/5 text-text-secondary'
                    }`}
                  >
                    {opt.is_correct ? <CheckCircle2 size={18} /> : <div className="w-[18px]" />}
                    <span className="text-sm">{opt.content}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && editingQuestion && (
        <QuestionEditorModal 
          bankId={bankId}
          question={editingQuestion}
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            fetchBankDetails();
          }}
        />
      )}

      {/* Quiz Creator Modal */}
      {showQuizModal && (
        <QuizCreatorModal 
          bankId={bankId}
          onClose={() => setShowQuizModal(false)}
        />
      )}
    </div>
  );
}

// Modal Component for Creating a Quiz
function QuizCreatorModal({ bankId, onClose }: any) {
  const [loading, setLoading] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    lesson_id: '',
    time_limit_minutes: 15,
    passing_score: 5,
    randomize: true,
    max_attempts: 1
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  async function fetchLessons() {
    const { data } = await supabase.from('lessons').select('id, title').order('created_at', { ascending: false });
    setLessons(data || []);
  }

  async function handleCreateQuiz(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.title.trim()) return alert('Vui lòng nhập tiêu đề bài kiểm tra');
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('quizzes')
        .insert({
          ...formData,
          bank_id: bankId,
          lesson_id: formData.lesson_id || null
        });

      if (error) throw error;
      alert('Đã tạo bài kiểm tra thành công!');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo bài kiểm tra');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="glass-panel max-w-lg w-full p-8 border-brand-primary/20">
        <h2 className="text-2xl font-black text-white mb-8">Cấu hình bài kiểm tra</h2>
        
        <form onSubmit={handleCreateQuiz} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Tiêu đề bài kiểm tra</label>
            <input 
              className="w-full bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Kiểm tra kiến thức chương 1"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Gắn vào bài giảng (Tùy chọn)</label>
            <select 
              className="w-full bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all"
              value={formData.lesson_id}
              onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
            >
              <option value="">Không gắn vào bài giảng nào</option>
              {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Thời gian (phút)</label>
              <input 
                type="number"
                className="w-full bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all"
                value={formData.time_limit_minutes}
                onChange={(e) => setFormData({ ...formData, time_limit_minutes: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Số lượt làm bài</label>
              <input 
                type="number"
                className="w-full bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all"
                value={formData.max_attempts}
                onChange={(e) => setFormData({ ...formData, max_attempts: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
            <input 
              type="checkbox"
              id="randomize"
              checked={formData.randomize}
              onChange={(e) => setFormData({ ...formData, randomize: e.target.checked })}
              className="w-5 h-5 accent-brand-primary"
            />
            <label htmlFor="randomize" className="text-sm font-semibold text-text-primary">Xáo trộn thứ tự câu hỏi</label>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-bold text-text-secondary hover:bg-bg-elevated transition-all"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-brand-primary text-black rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Tạo bài ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal Component for Editing Question
function QuestionEditorModal({ bankId, question, onClose, onSaved }: any) {
  const [data, setData] = useState(question);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!data.content.trim()) return alert('Vui lòng nhập nội dung câu hỏi');
    
    setLoading(true);
    try {
      const isNew = !data.id;
      
      // 1. Save Question
      const qPayload = {
        bank_id: bankId,
        content: data.content,
        type: data.type,
        points: data.points,
        order: data.order || 0
      };

      let qId = data.id;
      if (isNew) {
        const { data: newQ, error: qErr } = await supabase
          .from('questions')
          .insert(qPayload)
          .select()
          .single();
        if (qErr) throw qErr;
        qId = newQ.id;
      } else {
        await supabase.from('questions').update(qPayload).eq('id', data.id);
      }

      // 2. Save Options (Delete old ones first for simplicity if updating)
      if (!isNew) {
        await supabase.from('question_options').delete().eq('question_id', qId);
      }
      
      const optionsPayload = data.options.map((opt: any) => ({
        question_id: qId,
        content: opt.content,
        is_correct: opt.is_correct
      }));

      await supabase.from('question_options').insert(optionsPayload);

      onSaved();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi lưu câu hỏi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="glass-panel max-w-2xl w-full p-8 border-brand-primary/20 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-white">{data.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-text-muted">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Nội dung câu hỏi</label>
            <textarea 
              className="w-full bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all resize-none"
              rows={3}
              value={data.content}
              onChange={(e) => setData({ ...data, content: e.target.value })}
              placeholder="Nhập câu hỏi tại đây..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Loại câu hỏi</label>
              <select 
                className="w-full bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all"
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
              >
                <option value="multiple_choice">Trắc nghiệm (4 đáp án)</option>
                <option value="true_false">Đúng / Sai</option>
                <option value="fill_blank">Điền vào chỗ trống</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Điểm số</label>
              <input 
                type="number"
                className="w-full bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all"
                value={data.points}
                onChange={(e) => setData({ ...data, points: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-4">Các lựa chọn đáp án</label>
            <div className="space-y-3">
              {data.options.map((opt: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-center">
                  <button 
                    onClick={() => {
                      const newOpts = data.options.map((o: any, i: number) => ({
                        ...o,
                        is_correct: i === idx
                      }));
                      setData({ ...data, options: newOpts });
                    }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      opt.is_correct ? 'bg-green text-black' : 'bg-bg-elevated text-text-muted border border-white/5'
                    }`}
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <input 
                    className="flex-1 bg-bg-base border border-border-default rounded-xl p-4 text-white focus:border-brand-primary outline-none transition-all"
                    value={opt.content}
                    onChange={(e) => {
                      const newOpts = [...data.options];
                      newOpts[idx].content = e.target.value;
                      setData({ ...data, options: newOpts });
                    }}
                    placeholder={`Đáp án ${idx + 1}...`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 mt-4 border-t border-white/5 flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-xl font-bold text-text-secondary hover:bg-bg-elevated transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-4 bg-brand-primary text-black rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Lưu câu hỏi</>}
          </button>
        </div>
      </div>
    </div>
  );
}
