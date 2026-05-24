-- ==================================================================
-- MIGRATION: ADD ACHIEVEMENT TABLES FOR STUDENT DASHBOARD
-- Target Path: supabase/migrations/20260524165000_add_student_dashboard_achievements.sql
-- ==================================================================

-- 1. Bảng achievement_definitions
CREATE TABLE IF NOT EXISTS public.achievement_definitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INT DEFAULT 0,
  rarity TEXT CHECK (rarity IN ('common','uncommon','rare','legendary')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng student_achievements
CREATE TABLE IF NOT EXISTS public.student_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT REFERENCES public.achievement_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- 3. Seed dữ liệu achievement_definitions
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

-- 4. Enable RLS for these tables
ALTER TABLE public.achievement_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_achievements ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "view_definitions" ON public.achievement_definitions;
CREATE POLICY "view_definitions" ON public.achievement_definitions FOR SELECT USING (true);

DROP POLICY IF EXISTS "view_student_achievements" ON public.student_achievements;
CREATE POLICY "view_student_achievements" ON public.student_achievements FOR SELECT USING (true);
