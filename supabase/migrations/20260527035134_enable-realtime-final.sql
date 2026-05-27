-- Enable Realtime for admin dashboard tables
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'profiles: %', SQLERRM;
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lessons') THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.lessons';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'lessons: %', SQLERRM;
    END;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'exams') THEN
    BEGIN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.exams';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'exams: %', SQLERRM;
    END;
  END IF;
END $$;
