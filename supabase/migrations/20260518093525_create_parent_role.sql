-- ==================================================================
-- UNIFIED MIGRATION: LMS SCHEMA INITIALIZATION & PARENT ROLE SETUP
-- Target Path: supabase/migrations/20260518093525_create_parent_role.sql
-- ==================================================================

-- ━━━ BƯỚC 1: KHỞI TẠO CÁC BẢNG NỀN TẢNG (THEO ĐÚNG THỨ TỰ PHỤ THUỘC FK) ━━━

-- 1. Bảng schools
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  code TEXT UNIQUE NOT NULL, -- mã trường 6 ký tự
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng profiles (tham chiếu auth.users và schools)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'parent')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bổ sung các trường quan trọng cho profiles nếu bảng đã tồn tại trước đó
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id),
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS student_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- 3. Bảng courses
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  level TEXT DEFAULT 'Cơ bản',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Bảng lessons
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bổ sung các cột cho lessons để đồng bộ
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- 5. Bảng lesson_sections (chứa video, pdf, quiz, text)
CREATE TABLE IF NOT EXISTS public.lesson_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL, -- 'video', 'pdf', 'quiz', 'text'
  content_url TEXT,
  content_body TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Bảng classes (lớp học)
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL, -- "TIN001" (tự sinh)
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id),
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS school_year TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'Tin học',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 40;

-- 7. Bảng class_members (thành viên lớp)
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'left')),
  UNIQUE(class_id, student_id)
);

-- 8. Bảng assignments (bài tập)
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN (
    'build_config',      -- Lắp ráp PC theo yêu cầu
    'optimize_budget',   -- Tối ưu trong ngân sách X
    'minimize_tdp',      -- Giảm TDP xuống dưới Y watt
    'maximize_perf',     -- Tối đa hiệu năng
    'quiz',              -- Trắc nghiệm lý thuyết
    'mixed'              -- Kết hợp
  )),
  ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS allow_late_submit BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS late_penalty_percent INTEGER DEFAULT 20;

-- 9. Bảng submissions (bài nộp)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  pc_config JSONB,
  total_score INTEGER,
  auto_score INTEGER,
  teacher_score INTEGER,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  is_late BOOLEAN DEFAULT FALSE,
  graded_at TIMESTAMPTZ,
  UNIQUE(assignment_id, student_id)
);

-- 10. Bảng parent_student_links (liên kết phụ huynh - học sinh)
CREATE TABLE IF NOT EXISTS public.parent_student_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('father','mother','guardian','sibling','other')),
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active','revoked')),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.profiles(id),
  UNIQUE(parent_id, student_id)
);

-- Bảo đảm các cột quan trọng tồn tại trong parent_student_links phòng trường hợp bảng cũ đã được tạo trước đó
ALTER TABLE public.parent_student_links
  ADD COLUMN IF NOT EXISTS relationship TEXT DEFAULT 'parent' CHECK (relationship IN ('father','mother','guardian','sibling','other')),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active','revoked')),
  ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS linked_at TIMESTAMPTZ DEFAULT NOW();

-- 11. Bảng lesson_progress (tiến độ học bài)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed')),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  time_spent_seconds INT DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

-- Đảm bảo các cột tiến độ học tập có đầy đủ
ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS time_spent_seconds INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMPTZ;

-- 12. Bảng notifications (thông báo)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'quiz_graded',
    'lesson_completed',
    'assignment_submitted',
    'achievement_earned',
    'child_absent',
    'child_low_score',
    'child_completed_path',
    'parent_link_request',
    'teacher_message',
    'system'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Bảng daily_quests (nhiệm vụ hàng ngày) và user_quests
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tạo Unique Index độc lập cho user_quests (Thay thế cho UNIQUE constraint có chứa expression cast date)
CREATE UNIQUE INDEX IF NOT EXISTS user_quests_user_quest_date_idx
  ON public.user_quests (user_id, quest_id, ((created_at AT TIME ZONE 'UTC')::date));

-- 14. Hệ thống Quiz Engine
CREATE TABLE IF NOT EXISTS public.question_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  subject TEXT DEFAULT 'Tin học - Lắp ráp PC',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bank_id UUID REFERENCES public.question_banks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('single_choice', 'multiple_choice', 'true_false', 'fill_blank', 'ordering')) NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy','medium','hard')) DEFAULT 'medium',
  points INT DEFAULT 10,
  explanation TEXT,
  image_url TEXT,
  tags TEXT[],
  "order" INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  "order" INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  class_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_minutes INT,
  passing_score INT DEFAULT 70,
  randomize_questions BOOLEAN DEFAULT TRUE,
  randomize_options BOOLEAN DEFAULT TRUE,
  max_attempts INT DEFAULT 3,
  show_answers_after TEXT DEFAULT 'after_submit' CHECK (show_answers_after IN ('never', 'after_submit', 'after_deadline')),
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  "order" INT,
  PRIMARY KEY (quiz_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_taken_seconds INT,
  score NUMERIC(5,2),
  max_score INT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','graded','expired')),
  attempt_number INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option_ids UUID[],
  text_answer TEXT,
  ordering_answer UUID[],
  is_correct BOOLEAN,
  points_earned NUMERIC(5,2) DEFAULT 0,
  time_spent_seconds INT
);

-- 15. Lộ trình học (Learning Path)
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.path_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  path_id UUID REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('lesson','quiz','lab_session','milestone')),
  item_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  "order" INT NOT NULL,
  unlock_condition JSONB,
  estimated_minutes INT,
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(path_id, "order")
);

-- 16. Bảng diễn đàn / thảo luận (Discussion Forum)
CREATE TABLE IF NOT EXISTS public.discussion_threads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT DEFAULT 'question' CHECK (type IN ('question','discussion','announcement')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','resolved','pinned','closed')),
  upvote_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  is_teacher_answer BOOLEAN DEFAULT FALSE,
  upvote_count INT DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.discussion_upvotes (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES public.discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.discussion_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT one_target CHECK ((thread_id IS NULL) != (reply_id IS NULL)),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, reply_id)
);


-- ━━━ BƯỚC 2: CÁC FUNCTION & TRIGGER QUAN TRỌNG (HỌC SINH & PHỤ HUYNH) ━━━

-- 1. Đảm bảo vai trò profiles_role_check đầy đủ vai trò
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'teacher', 'admin', 'parent'));

-- 2. Sinh mã định danh PCM-XXXXXXXX tự động
CREATE OR REPLACE FUNCTION generate_student_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'PCM-';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger sinh student_code trước khi thêm mới profile
CREATE OR REPLACE FUNCTION auto_generate_student_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' AND NEW.student_code IS NULL THEN
    LOOP
      NEW.student_code := generate_student_code();
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM profiles WHERE student_code = NEW.student_code
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_student_code ON public.profiles;
CREATE TRIGGER trigger_auto_student_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION auto_generate_student_code();

-- Tự động điền student_code cho học sinh cũ nếu bị thiếu
UPDATE public.profiles
SET student_code = generate_student_code()
WHERE role = 'student' AND student_code IS NULL;

-- 3. Trigger tự động tạo Profile khi người dùng đăng ký tài khoản qua Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Trigger đồng bộ số lượng câu trả lời trong Diễn đàn thảo luận
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.discussion_threads
  SET reply_count = reply_count + 1
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_reply_insert ON public.discussion_replies;
CREATE TRIGGER on_reply_insert
  AFTER INSERT ON public.discussion_replies
  FOR EACH ROW EXECUTE FUNCTION update_reply_count();


-- ━━━ BƯỚC 3: HỆ THỐNG PHÂN QUYỀN BẢO MẬT ROW LEVEL SECURITY (RLS) ━━━

-- Bật RLS cho các bảng
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.path_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_upvotes ENABLE ROW LEVEL SECURITY;

-- CÀI ĐẶT POLICIES (Tự động xoá nếu tồn tại để tránh lỗi duplicate)

-- ─── PROFILES & SCHOOLS ───
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin read all profiles" ON public.profiles;
CREATE POLICY "Admin read all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Schools are viewable by everyone" ON public.schools;
CREATE POLICY "Schools are viewable by everyone" ON public.schools FOR SELECT USING (true);

-- ─── PARENT - STUDENT LINKS ───
DROP POLICY IF EXISTS "parent_own_links" ON public.parent_student_links;
CREATE POLICY "parent_own_links" ON public.parent_student_links FOR ALL USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "student_view_own_links" ON public.parent_student_links;
CREATE POLICY "student_view_own_links" ON public.parent_student_links FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "student_revoke_link" ON public.parent_student_links;
CREATE POLICY "student_revoke_link" ON public.parent_student_links FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (status = 'revoked' AND revoked_by = auth.uid());

-- ─── LESSONS & SECTIONS ───
DROP POLICY IF EXISTS "teacher_own_lessons" ON public.lessons;
CREATE POLICY "teacher_own_lessons" ON public.lessons FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "published_lessons_readable" ON public.lessons;
CREATE POLICY "published_lessons_readable" ON public.lessons FOR SELECT USING (is_published = TRUE);

DROP POLICY IF EXISTS "lesson_sections_via_lesson" ON public.lesson_sections;
CREATE POLICY "lesson_sections_via_lesson" ON public.lesson_sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lessons l WHERE l.id = lesson_id AND (l.is_published = TRUE OR l.teacher_id = auth.uid()))
);

DROP POLICY IF EXISTS "teacher_manage_sections" ON public.lesson_sections;
CREATE POLICY "teacher_manage_sections" ON public.lesson_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM public.lessons l WHERE l.id = lesson_id AND l.teacher_id = auth.uid())
);

-- ─── CLASSES & MEMBERS ───
DROP POLICY IF EXISTS "teacher_own_classes" ON public.classes;
CREATE POLICY "teacher_own_classes" ON public.classes FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "student_view_enrolled_class" ON public.classes;
CREATE POLICY "student_view_enrolled_class" ON public.classes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_members cm WHERE cm.class_id = id AND cm.student_id = auth.uid())
);

DROP POLICY IF EXISTS "teacher_manage_class_members" ON public.class_members;
CREATE POLICY "teacher_manage_class_members" ON public.class_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "student_view_own_membership" ON public.class_members;
CREATE POLICY "student_view_own_membership" ON public.class_members FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "student_can_join_class" ON public.class_members;
CREATE POLICY "student_can_join_class" ON public.class_members FOR INSERT WITH CHECK (student_id = auth.uid());

-- ─── ASSIGNMENTS & SUBMISSIONS ───
DROP POLICY IF EXISTS "teacher_own_assignments" ON public.assignments;
CREATE POLICY "teacher_own_assignments" ON public.assignments FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "student_view_class_assignments" ON public.assignments;
CREATE POLICY "student_view_class_assignments" ON public.assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.class_members cm WHERE cm.class_id = assignments.class_id AND cm.student_id = auth.uid())
);

DROP POLICY IF EXISTS "student_sees_own_submissions" ON public.submissions;
CREATE POLICY "student_sees_own_submissions" ON public.submissions FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "teacher_sees_class_submissions" ON public.submissions;
CREATE POLICY "teacher_sees_class_submissions" ON public.submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.teacher_id = auth.uid())
);

-- ─── LESSON PROGRESS (Học sinh & Phụ huynh) ───
DROP POLICY IF EXISTS "student_own_progress" ON public.lesson_progress;
CREATE POLICY "student_own_progress" ON public.lesson_progress FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "teacher_view_class_progress" ON public.lesson_progress;
CREATE POLICY "teacher_view_class_progress" ON public.lesson_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    JOIN public.class_members cm ON cm.class_id = c.id
    WHERE cm.student_id = lesson_progress.student_id AND c.teacher_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "parent_view_child_progress" ON public.lesson_progress;
CREATE POLICY "parent_view_child_progress" ON public.lesson_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.parent_student_links psl
    WHERE psl.parent_id = auth.uid() AND psl.student_id = lesson_progress.student_id AND psl.status = 'active'
  )
);

-- ─── NOTIFICATIONS ───
DROP POLICY IF EXISTS "own_notifications" ON public.notifications;
CREATE POLICY "own_notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());

-- ─── QUIZ ENGINE ───
DROP POLICY IF EXISTS "student_own_attempts" ON public.quiz_attempts;
CREATE POLICY "student_own_attempts" ON public.quiz_attempts FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "student_own_answers" ON public.quiz_answers;
CREATE POLICY "student_own_answers" ON public.quiz_answers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.quiz_attempts WHERE id = attempt_id AND student_id = auth.uid())
);

DROP POLICY IF EXISTS "teacher_view_attempts" ON public.quiz_attempts;
CREATE POLICY "teacher_view_attempts" ON public.quiz_attempts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- ─── LEARNING PATH ───
DROP POLICY IF EXISTS "view_paths" ON public.learning_paths;
CREATE POLICY "view_paths" ON public.learning_paths FOR SELECT USING (true);

DROP POLICY IF EXISTS "manage_paths" ON public.learning_paths;
CREATE POLICY "manage_paths" ON public.learning_paths FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

DROP POLICY IF EXISTS "view_path_items" ON public.path_items;
CREATE POLICY "view_path_items" ON public.path_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "manage_path_items" ON public.path_items;
CREATE POLICY "manage_path_items" ON public.path_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

-- ─── DISCUSSION FORUMS ───
DROP POLICY IF EXISTS "view_threads" ON public.discussion_threads;
CREATE POLICY "view_threads" ON public.discussion_threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "create_thread" ON public.discussion_threads;
CREATE POLICY "create_thread" ON public.discussion_threads FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_or_teacher_thread" ON public.discussion_threads;
CREATE POLICY "delete_own_or_teacher_thread" ON public.discussion_threads FOR UPDATE USING (
  author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

DROP POLICY IF EXISTS "view_replies" ON public.discussion_replies;
CREATE POLICY "view_replies" ON public.discussion_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "create_reply" ON public.discussion_replies;
CREATE POLICY "create_reply" ON public.discussion_replies FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "delete_own_or_teacher_reply" ON public.discussion_replies;
CREATE POLICY "delete_own_or_teacher_reply" ON public.discussion_replies FOR UPDATE USING (
  author_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'teacher')
);

DROP POLICY IF EXISTS "manage_upvotes" ON public.discussion_upvotes;
CREATE POLICY "manage_upvotes" ON public.discussion_upvotes FOR ALL USING (user_id = auth.uid());

-- ─── DAILY QUESTS ───
DROP POLICY IF EXISTS "Everyone can view quests" ON public.daily_quests;
CREATE POLICY "Everyone can view quests" ON public.daily_quests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own quest progress" ON public.user_quests;
CREATE POLICY "Users can view their own quest progress" ON public.user_quests FOR SELECT USING (auth.uid() = user_id);


-- ━━━ BƯỚC 4: VIEWS & FUNCTIONS TIỆN ÍCH DÀNH CHO CLIENTS ━━━

-- 1. View xem tổng quan tiến độ của Con (dành cho Phụ huynh)
CREATE OR REPLACE VIEW public.child_summary_for_parent AS
  SELECT
    p.id AS student_id,
    p.full_name AS student_name,
    p.student_code,
    p.school_name,
    p.xp,
    p.level,
    p.avatar_url,
    COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.status = 'completed') AS lessons_completed,
    COUNT(DISTINCT lp.lesson_id) AS lessons_started,
    SUM(lp.time_spent_seconds) AS total_time_seconds,
    MAX(lp.last_accessed) AS last_active,
    psl.parent_id
  FROM public.profiles p
  JOIN public.parent_student_links psl ON psl.student_id = p.id
  LEFT JOIN public.lesson_progress lp ON lp.student_id = p.id
  WHERE psl.status = 'active' AND p.role = 'student'
  GROUP BY p.id, p.full_name, p.student_code, p.school_name,
           p.xp, p.level, p.avatar_url, psl.parent_id;

-- 2. View lấy danh sách câu hỏi Quiz được lọc sẵn (cho Học sinh làm bài an toàn)
CREATE OR REPLACE VIEW public.quiz_questions_for_student AS
  SELECT
    q.id, q.content, q.type, q.points, q.image_url,
    q.tags, qq.order,
    json_agg(
      json_build_object(
        'id', qo.id,
        'content', qo.content,
        'order', qo.order
      ) ORDER BY qo.order
    ) AS options,
    qq.quiz_id
  FROM public.questions q
  JOIN public.quiz_questions qq ON qq.question_id = q.id
  JOIN public.question_options qo ON qo.question_id = q.id
  GROUP BY q.id, q.content, q.type, q.points, q.image_url, q.tags, qq.order, qq.quiz_id;

-- 3. Function cho phụ huynh tìm học sinh bằng mã PCM-XXXXXXXX
CREATE OR REPLACE FUNCTION public.find_student_by_code(input_code TEXT)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  school_name TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
    SELECT p.id, p.full_name, p.school_name, p.avatar_url
    FROM public.profiles p
    WHERE p.student_code = UPPER(TRIM(input_code))
      AND p.role = 'student';
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_student_by_code TO authenticated;

-- 4. Function tính trạng thái mở khoá lộ trình học (Learning Path)
CREATE OR REPLACE FUNCTION public.get_unlocked_items(
  p_student_id UUID,
  p_path_id UUID
) RETURNS TABLE (
  id UUID,
  item_id UUID,
  is_unlocked BOOLEAN,
  unlock_reason TEXT
) AS $$
DECLARE
  item RECORD;
  cond JSONB;
  cond_type TEXT;
  cond_item_id UUID;
  min_sc NUMERIC;
  prev_completed BOOLEAN;
  quiz_passed BOOLEAN;
BEGIN
  FOR item IN
    SELECT * FROM public.path_items WHERE path_id = p_path_id ORDER BY "order"
  LOOP
    cond := item.unlock_condition;
    is_unlocked := TRUE;
    unlock_reason := 'always_available';

    IF cond IS NOT NULL THEN
      cond_type := cond->>'type';

      -- Hoàn thành bài học trước đó
      IF cond_type = 'complete_previous' THEN
        SELECT EXISTS (
          SELECT 1 FROM public.lesson_progress lp
          JOIN public.path_items pi ON pi.item_id = lp.lesson_id
          WHERE lp.student_id = p_student_id
            AND lp.status = 'completed'
            AND pi.path_id = p_path_id
            AND pi.order = item.order - 1
        ) INTO prev_completed;

        IF NOT prev_completed THEN
          is_unlocked := FALSE;
          unlock_reason := 'need_complete_previous';
        END IF;

      -- Đạt điểm quiz tối thiểu
      ELSIF cond_type = 'score_above' THEN
        cond_item_id := (cond->>'item_id')::UUID;
        min_sc := (cond->>'min_score')::NUMERIC;

        SELECT EXISTS (
          SELECT 1 FROM public.quiz_attempts
          WHERE student_id = p_student_id
            AND quiz_id = cond_item_id
            AND score >= min_sc
            AND status = 'submitted'
        ) INTO quiz_passed;

        IF NOT quiz_passed THEN
          is_unlocked := FALSE;
          unlock_reason := 'need_quiz_score_above_' || min_sc::TEXT;
        END IF;
      END IF;
    END IF;

    id := item.id;
    item_id := item.item_id;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ━━━ BƯỚC 5: HÀNG ĐỢI CRON JOB TỰ ĐỘNG THÔNG BÁO CHO PHỤ HUYNH ━━━
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'notify-parent-absent',
      '0 20 * * *',
      $cron$
        INSERT INTO public.notifications (user_id, type, title, body, data, action_url)
        SELECT
          psl.parent_id,
          'child_absent',
          'Con bạn chưa học trong 3 ngày',
          p.full_name || ' chưa đăng nhập học trong 3 ngày qua. Hãy nhắc nhở con!',
          jsonb_build_object('student_id', p.id, 'student_name', p.full_name),
          '/parent/children/' || p.id
        FROM public.profiles p
        JOIN public.parent_student_links psl ON psl.student_id = p.id
        LEFT JOIN public.lesson_progress lp ON lp.student_id = p.id
          AND lp.last_accessed > NOW() - INTERVAL '3 days'
        WHERE psl.status = 'active'
          AND p.role = 'student'
          AND lp.id IS NULL
        GROUP BY psl.parent_id, p.id, p.full_name;
      $cron$
    );
  END IF;
END $do$;
