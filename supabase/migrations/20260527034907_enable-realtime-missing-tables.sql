-- Enable Realtime for admin dashboard tables
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS lessons;
ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS exams;
