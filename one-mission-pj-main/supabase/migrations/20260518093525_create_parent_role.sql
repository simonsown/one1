-- ==================================================================
-- PROMPT 1 · PC MASTER LMS — DATABASE SCHEMA + PARENT ROLE
-- Run all of this SQL in your Supabase SQL Editor
-- Target Directory: database/20260518_parent_role.sql
-- ==================================================================

-- ━━━ BƯỚC 1: THÊM ROLE PARENT VÀ STUDENT_CODE VÀO PROFILES ━━━
-- Thêm role 'parent' vào profiles check constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'teacher', 'admin', 'parent'));

-- Thêm các cột bổ sung cho profile nếu chưa có
-- student_code định dạng: PCM-XXXXXXXX (8 ký tự alphanumeric)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Function tự động sinh student_code
CREATE OR REPLACE FUNCTION generate_student_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := 'PCM-';
  i INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Trigger: tự sinh student_code khi insert profile có role = 'student'
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

-- Backfill cho học sinh đã tồn tại nhưng chưa có student_code
UPDATE public.profiles
SET student_code = generate_student_code()
WHERE role = 'student' AND student_code IS NULL;


-- ━━━ BƯỚC 1.5: ĐẢM BẢO CÁC CỘT QUAN TRỌNG TỒN TẠI TRONG CÁC BẢNG LIÊN QUAN ━━━
-- Đảm bảo bảng lessons có đủ cột teacher_id, is_published... để tránh lỗi RLS/Views
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Đảm bảo bảng classes có đủ cột teacher_id... để tránh lỗi RLS/Views
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS grade TEXT,
  ADD COLUMN IF NOT EXISTS school_year TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'Tin học',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 40;

-- Đảm bảo bảng assignments có đủ cột teacher_id... để tránh lỗi RLS/Views
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS allow_late_submit BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS late_penalty_percent INTEGER DEFAULT 20;


-- ━━━ BƯỚC 2: BẢNG LIÊN KẾT PHỤ HUYNH - HỌC SINH ━━━
-- Xóa bảng cũ nếu tồn tại cấu trúc xung đột để đảm bảo tạo đầy đủ cột status
DROP TABLE IF EXISTS public.parent_student_links CASCADE;

CREATE TABLE public.parent_student_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT DEFAULT 'parent'
    CHECK (relationship IN ('father','mother','guardian','sibling','other')),
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active','revoked')),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES public.profiles(id),
  UNIQUE(parent_id, student_id)
);

-- Bật RLS cho bảng liên kết phụ huynh - học sinh
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- Cài đặt policies
DROP POLICY IF EXISTS "parent_own_links" ON public.parent_student_links;
CREATE POLICY "parent_own_links" ON public.parent_student_links
  FOR ALL USING (parent_id = auth.uid());

DROP POLICY IF EXISTS "student_view_own_links" ON public.parent_student_links;
CREATE POLICY "student_view_own_links" ON public.parent_student_links
  FOR SELECT USING (student_id = auth.uid());

DROP POLICY IF EXISTS "student_revoke_link" ON public.parent_student_links;
CREATE POLICY "student_revoke_link" ON public.parent_student_links
  FOR UPDATE USING (student_id = auth.uid())
  WITH CHECK (status = 'revoked' AND revoked_by = auth.uid());


-- ━━━ BƯỚC 3: RLS POLICIES CHO CÁC BẢNG HIỆN CÓ ━━━
-- ─── LESSONS ───
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_own_lessons" ON public.lessons;
CREATE POLICY "teacher_own_lessons" ON public.lessons
  FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "published_lessons_readable" ON public.lessons;
CREATE POLICY "published_lessons_readable" ON public.lessons
  FOR SELECT USING (is_published = TRUE);

-- ─── LESSON SECTIONS ───
ALTER TABLE public.lesson_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lesson_sections_via_lesson" ON public.lesson_sections;
CREATE POLICY "lesson_sections_via_lesson" ON public.lesson_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_id
        AND (l.is_published = TRUE OR l.teacher_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "teacher_manage_sections" ON public.lesson_sections;
CREATE POLICY "teacher_manage_sections" ON public.lesson_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      WHERE l.id = lesson_id AND l.teacher_id = auth.uid()
    )
  );

-- ─── CLASSES ───
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_own_classes" ON public.classes;
CREATE POLICY "teacher_own_classes" ON public.classes
  FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "student_view_enrolled_class" ON public.classes;
CREATE POLICY "student_view_enrolled_class" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      WHERE cm.class_id = id AND cm.student_id = auth.uid()
    )
  );

-- ─── ASSIGNMENTS ───
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_own_assignments" ON public.assignments;
CREATE POLICY "teacher_own_assignments" ON public.assignments
  FOR ALL USING (teacher_id = auth.uid());

DROP POLICY IF EXISTS "student_view_class_assignments" ON public.assignments;
CREATE POLICY "student_view_class_assignments" ON public.assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_members cm
      WHERE cm.class_id = assignments.class_id
        AND cm.student_id = auth.uid()
    )
  );


-- ━━━ BƯỚC 4: BẢNG CLASS_MEMBERS ━━━
CREATE TABLE IF NOT EXISTS public.class_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

ALTER TABLE public.class_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_manage_class_members" ON public.class_members;
CREATE POLICY "teacher_manage_class_members" ON public.class_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_id AND c.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "student_view_own_membership" ON public.class_members;
CREATE POLICY "student_view_own_membership" ON public.class_members
  FOR SELECT USING (student_id = auth.uid());


-- ━━━ BƯỚC 5: BẢNG LESSON_PROGRESS (tracking) ━━━
-- Xóa bảng cũ (nếu có xung đột cấu trúc) để đảm bảo có cột student_id và status đầy đủ
DROP TABLE IF EXISTS public.lesson_progress CASCADE;

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started'
    CHECK (status IN ('not_started','in_progress','completed')),
  completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  time_spent_seconds INT DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_own_progress" ON public.lesson_progress;
CREATE POLICY "student_own_progress" ON public.lesson_progress
  FOR ALL USING (student_id = auth.uid());

DROP POLICY IF EXISTS "teacher_view_class_progress" ON public.lesson_progress;
CREATE POLICY "teacher_view_class_progress" ON public.lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.classes c
      JOIN public.class_members cm ON cm.class_id = c.id
      WHERE cm.student_id = lesson_progress.student_id
        AND c.teacher_id = auth.uid()
    )
  );

-- ★ POLICY: PHỤ HUYNH XEM TIẾN ĐỘ CỦA CON ĐÃ LIÊN KẾT
DROP POLICY IF EXISTS "parent_view_child_progress" ON public.lesson_progress;
CREATE POLICY "parent_view_child_progress" ON public.lesson_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      WHERE psl.parent_id = auth.uid()
        AND psl.student_id = lesson_progress.student_id
        AND psl.status = 'active'
    )
  );


-- ━━━ BƯỚC 6: BẢNG NOTIFICATIONS ━━━
-- Xóa bảng cũ (nếu có xung đột cấu trúc) để đảm bảo có cột user_id, type và body đầy đủ
DROP TABLE IF EXISTS public.notifications CASCADE;

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'quiz_graded',
    'lesson_completed',
    'assignment_submitted',
    'achievement_earned',
    'child_absent',        -- Phụ huynh: con không học X ngày
    'child_low_score',     -- Phụ huynh: con điểm thấp
    'child_completed_path',-- Phụ huynh: con hoàn thành lộ trình
    'parent_link_request', -- Học sinh: có phụ huynh muốn liên kết
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

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_notifications" ON public.notifications;
CREATE POLICY "own_notifications" ON public.notifications
  FOR ALL USING (user_id = auth.uid());


-- ━━━ BƯỚC 7: VIEWS TIỆN ÍCH CHO PHỤ HUYNH ━━━
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


-- ━━━ BƯỚC 8: FUNCTION TÌM KIẾM HỌC SINH THEO CODE ━━━
-- Phụ huynh nhập student_code → trả về thông tin cơ bản an toàn để xác nhận liên kết
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

-- Cấp quyền gọi function cho tất cả authenticated users
GRANT EXECUTE ON FUNCTION public.find_student_by_code TO authenticated;


-- ━━━ BƯỚC 9: CRON JOB GỬI THÔNG BÁO CHO PHỤ HUYNH (nếu có pg_cron) ━━━
-- Chạy vào 20:00 hàng ngày, kiểm tra học sinh nghỉ học từ 3 ngày trở lên để báo phụ huynh
DO $do$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Đăng ký job thông qua pg_cron với định danh $cron$ độc lập để tránh lỗi lồng $
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
