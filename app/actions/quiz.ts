'use server';

import { createClient } from '@/lib/supabase-ssr-server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { shuffleArray, scoreQuestion, StudentAnswer } from '@/lib/quiz-engine';
import { checkAndAwardAchievements } from '@/lib/achievements';

export async function getAuthUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function startQuizAttempt(quizId: string) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  const { data: quiz, error: quizErr } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (quizErr || !quiz) throw new Error('Không tìm thấy bài kiểm tra.');
  if (quiz.is_published === false) throw new Error('Bài kiểm tra chưa được mở.');

  const now = new Date();
  if (quiz.available_from && new Date(quiz.available_from) > now) throw new Error('Chưa đến giờ làm bài.');
  if (quiz.available_until && new Date(quiz.available_until) < now) throw new Error('Đã hết hạn làm bài.');

  // Check attempts
  if (quiz.max_attempts) {
    const { count } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('quiz_id', quizId)
      .eq('student_id', user.id)
      .not('status', 'eq', 'in_progress');

    if (count !== null && count >= quiz.max_attempts) {
      throw new Error(`Bạn đã hết lượt làm bài. Tối đa: ${quiz.max_attempts} lần.`);
    }
  }

  // Find if already in progress
  const { data: existingAttempt } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('quiz_id', quizId)
    .eq('student_id', user.id)
    .eq('status', 'in_progress')
    .single();

  let attemptId = existingAttempt?.id;

  if (!attemptId) {
    const { data: newAttempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        student_id: user.id,
        status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (attemptError) throw attemptError;
    attemptId = newAttempt.id;
  }

  // Get safe questions using the view
  const { data: questions, error: qErr } = await supabase
    .from('quiz_questions_for_student')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order', { ascending: true });

  if (qErr) throw qErr;

  let finalQuestions = questions || [];
  if (quiz.randomize_questions) {
    finalQuestions = shuffleArray(finalQuestions);
  }

  if (quiz.randomize_options) {
    finalQuestions = finalQuestions.map((q: any) => ({
      ...q,
      options: shuffleArray(q.options || [])
    }));
  }

  return { attemptId, questions: finalQuestions, timeLimit: quiz.time_limit_minutes };
}

export async function submitQuizAttempt(attemptId: string, answers: StudentAnswer[]) {
  const supabase = await createClient();
  const user = await getAuthUser(supabase);

  const { data: attempt, error: attErr } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes(id, max_attempts)')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single();

  if (attErr || !attempt) throw new Error('Attempt không tồn tại.');
  if (attempt.status !== 'in_progress') throw new Error('Bài làm này đã được nộp.');

  // Fetch full questions to grade
  const questionIds = answers.map(a => a.questionId);
  const { data: questions } = await supabase
    .from('questions')
    .select('id, type, points, question_options(id, is_correct, content, "order")')
    .in('id', questionIds);

  let totalScore = 0;
  let totalMaxScore = 0;
  const answerRecords = [];

  for (const dbQ of (questions || [])) {
    totalMaxScore += dbQ.points || 0;
    const studentAns = answers.find(a => a.questionId === dbQ.id);
    if (!studentAns) continue;

    const pointsEarned = scoreQuestion(dbQ.type as any, studentAns, dbQ.question_options as any, dbQ.points || 0);
    totalScore += pointsEarned;
    const isCorrect = pointsEarned > 0;

    answerRecords.push({
      attempt_id: attemptId,
      question_id: dbQ.id,
      selected_option_ids: studentAns.selectedOptionIds || null,
      text_answer: studentAns.textAnswer || null,
      ordering_answer: studentAns.orderingAnswer || null,
      time_spent_seconds: studentAns.timeSpentSeconds || 0,
      is_correct: isCorrect,
      points_earned: pointsEarned
    });
  }

  // Insert answers
  if (answerRecords.length > 0) {
    await supabase.from('quiz_answers').insert(answerRecords);
  }

  // Calculate final score
  const finalScore = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  await supabase
    .from('quiz_attempts')
    .update({
      score: finalScore,
      max_score: totalMaxScore,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    })
    .eq('id', attemptId);

  // Gửi thông báo trực tiếp vào DB để kích hoạt Realtime
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'quiz_graded',
    title: 'Bài thi đã được chấm điểm!',
    body: `Bạn đạt ${finalScore.toFixed(1)}% điểm. Click để xem chi tiết kết quả.`,
    action_url: `/student/quiz/${attemptId}/results`,
    data: { quizId: attempt.quizzes.id, attemptId, score: finalScore }
  });

  // Evaluate and award achievements
  await checkAndAwardAchievements(supabase, user.id, 'quiz_submitted');

  revalidatePath(`/student/quiz/${attempt.quizzes.id}`);
  return { attemptId, score: finalScore, redirect: `/student/quiz/${attemptId}/results` };
}

export async function expireQuizAttempt(attemptId: string, answers: StudentAnswer[]) {
  // Similar to submit but sets status to expired
  const res = await submitQuizAttempt(attemptId, answers);
  const supabase = await createClient();
  await supabase.from('quiz_attempts').update({ status: 'expired' }).eq('id', attemptId);
  return res;
}
