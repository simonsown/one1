'use server';

import { createClient } from '@/lib/supabase-ssr-server';
import { revalidatePath } from 'next/cache';
import { QuizAttempt, AttemptStatus } from '@/types/quiz';

/**
 * Bắt đầu một bài kiểm tra mới
 * Chế độ chuyên nghiệp: Lấy câu hỏi từ ngân hàng đề thi liên kết
 */
export async function startQuiz(quizId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Vui lòng đăng nhập để bắt đầu.');

  // 1. Lấy thông tin Quiz và kiểm tra số lần làm bài
  const { data: quiz, error: quizErr } = await supabase
    .from('quizzes')
    .select('id, title, max_attempts, randomize, bank_id')
    .eq('id', quizId)
    .single();

  if (quizErr || !quiz) throw new Error('Không tìm thấy bài kiểm tra.');

  const { count } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('quiz_id', quizId)
    .eq('student_id', user.id)
    .eq('status', 'submitted');

  if (count !== null && count >= quiz.max_attempts) {
    throw new Error(`Bạn đã hết lượt làm bài. Số lượt tối đa: ${quiz.max_attempts}`);
  }

  // 2. Tạo attempt mới (Nếu có attempt cũ 'in_progress' thì dùng lại hoặc tạo mới tùy logic)
  // Ở đây tôi tạo mới để đảm bảo tính minh bạch
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert({
      quiz_id: quizId,
      student_id: user.id,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  if (attemptError) throw attemptError;

  // 3. Lấy danh sách câu hỏi từ ngân hàng đề thi
  let query = supabase
    .from('questions')
    .select(`
      id,
      content,
      type,
      points,
      order,
      options:question_options (
        id,
        content
      )
    `)
    .eq('bank_id', quiz.bank_id);

  const { data: questions, error: questionsError } = await query;

  if (questionsError) throw questionsError;

  // 4. Xáo trộn câu hỏi nếu Quiz có yêu cầu
  let finalQuestions = questions || [];
  if (quiz.randomize) {
    finalQuestions = [...finalQuestions].sort(() => Math.random() - 0.5);
  }

  return { attempt, questions: finalQuestions };
}

/**
 * Nộp bài và chấm điểm phía Server (Bảo mật 100%)
 */
export async function submitQuiz(attemptId: string, answers: any[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  // 1. Kiểm tra attempt và lấy quiz_id
  const { data: attempt, error: attErr } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes(id, bank_id)')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single();

  if (attErr || !attempt || attempt.status !== 'in_progress') {
    throw new Error('Lần làm bài không hợp lệ hoặc đã kết thúc.');
  }

  // 2. Lấy đáp án đúng từ Database (Không tin tưởng data từ client)
  const questionIds = answers.map(a => a.question_id);
  
  const { data: correctOptions } = await supabase
    .from('question_options')
    .select('id, question_id, is_correct, content')
    .in('question_id', questionIds)
    .eq('is_correct', true);

  const { data: dbQuestions } = await supabase
    .from('questions')
    .select('id, points, type')
    .in('id', questionIds);

  let totalScore = 0;
  const answerRecords = [];

  for (const answer of answers) {
    const question = dbQuestions?.find(q => q.id === answer.question_id);
    const correctOption = correctOptions?.find(o => o.question_id === answer.question_id);
    
    let isCorrect = false;
    let pointsEarned = 0;

    if (question?.type === 'multiple_choice' || question?.type === 'true_false') {
      isCorrect = answer.selected_option_id === correctOption?.id;
    } else if (question?.type === 'fill_blank') {
      isCorrect = answer.text_answer?.trim().toLowerCase() === correctOption?.content.trim().toLowerCase();
    }

    if (isCorrect) {
      pointsEarned = question?.points || 0;
      totalScore += pointsEarned;
    }

    answerRecords.push({
      attempt_id: attemptId,
      question_id: answer.question_id,
      selected_option_id: answer.selected_option_id,
      text_answer: answer.text_answer,
      is_correct: isCorrect,
      points_earned: pointsEarned
    });
  }

  // 3. Ghi kết quả vào Database
  const { error: answersErr } = await supabase.from('quiz_answers').insert(answerRecords);
  if (answersErr) throw answersErr;
  
  const { data: updatedAttempt, error: updateErr } = await supabase
    .from('quiz_attempts')
    .update({
      score: totalScore,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    })
    .eq('id', attemptId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  revalidatePath(`/student/quiz/${attempt.quiz_id}`);
  
  return updatedAttempt;
}

/**
 * Lấy kết quả bài thi chi tiết (bao gồm cả đáp án đúng để so sánh)
 */
export async function getQuizResult(attemptId: string) {
  const supabase = await createClient();
  
  const { data: attempt, error: attErr } = await supabase
    .from('quiz_attempts')
    .select(`
      *,
      quiz:quizzes (*),
      answers:quiz_answers (
        *,
        question:questions (
          *,
          options:question_options (*)
        )
      )
    `)
    .eq('id', attemptId)
    .single();

  if (attErr) throw attErr;
  return attempt;
}

