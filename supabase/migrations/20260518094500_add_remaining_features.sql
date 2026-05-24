-- ==================================================================
-- MIGRATION: ADD REMAINING FEATURES (PREFERENCES, BUILDER LAB, ACHIEVEMENTS & CERTIFICATES)
-- Target Path: supabase/migrations/20260518094500_add_remaining_features.sql
-- ==================================================================

-- 1. Bảng user_preferences (Tùy chọn giao diện & thông báo)
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  show_profile_public BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light', 'system')),
  language TEXT DEFAULT 'vi' CHECK (language IN ('vi', 'en')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng builder_sessions (Lịch sử lắp ráp PC thực hành tại Builder Lab)
CREATE TABLE IF NOT EXISTS public.builder_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  components_used JSONB DEFAULT '[]'::jsonb,
  tdp_calculated NUMERIC,
  compatibility_score INT DEFAULT 100
);

-- 3. Bảng achievement_definitions & student_achievements (Thành tích & Huy hiệu)
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INT DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common','uncommon','rare','legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- Nạp hạt dữ liệu (Seed) cho Achievements
INSERT INTO public.achievement_definitions (id, title, description, icon, points, rarity)
VALUES 
  ('first_lesson', 'Khởi đầu hành trình', 'Hoàn thành bài giảng đầu tiên', '🎯', 10, 'common'),
  ('quiz_ace', 'Xuất sắc', 'Đạt điểm tuyệt đối (100%) trong một bài quiz', '⭐', 50, 'rare'),
  ('week_streak', 'Kiên trì 7 ngày', 'Học liên tiếp 7 ngày không nghỉ', '🔥', 30, 'uncommon'),
  ('pc_master', 'PC Master', 'Hoàn thành tất cả bài trong lộ trình', '🖥️', 100, 'legendary'),
  ('lab_expert', 'Chuyên gia Lab', 'Dành hơn 10 giờ trong Builder Lab', '⚙️', 40, 'uncommon'),
  ('helpful_member', 'Nhiệt tình', 'Được upvote 10 lần trong diễn đàn', '🤝', 25, 'common')
ON CONFLICT (id) DO UPDATE 
SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  points = EXCLUDED.points,
  rarity = EXCLUDED.rarity;

-- 4. Bảng certificates (Chứng nhận hoàn thành lộ trình học)
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,          
  verify_url TEXT,       
  student_name TEXT,     
  course_title TEXT,     
  completion_date DATE DEFAULT CURRENT_DATE,
  final_score NUMERIC(5,2),
  is_revoked BOOLEAN DEFAULT FALSE
);

-- Hàm tự động sinh số chứng chỉ ngẫu nhiên
CREATE OR REPLACE FUNCTION public.generate_cert_number()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := 'PCM-2026-';
  i INT;
BEGIN
  FOR i IN 1..5 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;


-- ━━━ HỆ THỐNG PHÂN QUYỀN ROW LEVEL SECURITY (RLS) & POLICIES ━━━

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.builder_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Preferences Policies
DROP POLICY IF EXISTS "own_preferences" ON public.user_preferences;
CREATE POLICY "own_preferences" ON public.user_preferences FOR ALL USING (user_id = auth.uid());

-- Builder Sessions Policies
DROP POLICY IF EXISTS "student_own_sessions" ON public.builder_sessions;
CREATE POLICY "student_own_sessions" ON public.builder_sessions FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "teacher_view_sessions" ON public.builder_sessions;
CREATE POLICY "teacher_view_sessions" ON public.builder_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- Achievement Policies
DROP POLICY IF EXISTS "view_definitions" ON public.achievement_definitions;
CREATE POLICY "view_definitions" ON public.achievement_definitions FOR SELECT USING (true);

DROP POLICY IF EXISTS "view_student_achievements" ON public.student_achievements;
CREATE POLICY "view_student_achievements" ON public.student_achievements FOR SELECT USING (true);

-- Certificate Policies
DROP POLICY IF EXISTS "view_all_certificates" ON public.certificates;
CREATE POLICY "view_all_certificates" ON public.certificates FOR SELECT USING (true);

DROP POLICY IF EXISTS "manage_certificates" ON public.certificates;
CREATE POLICY "manage_certificates" ON public.certificates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);
