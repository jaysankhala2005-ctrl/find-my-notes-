-- ============================================================
-- Find My Notes - Complete Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'faculty', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  year_of_study INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COURSES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  duration_years INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SEMESTERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.semesters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, number)
);

-- ============================================================
-- SUBJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT,
  subject_code TEXT,
  description TEXT,
  credits INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UNITS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.units (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id, number)
);

-- ============================================================
-- NOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('handwritten', 'university', 'shivani')),
  subcategory TEXT CHECK (subcategory IN ('faculty', 'student', NULL)),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTIONS TABLE (MIMP - Important Questions)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  question_type TEXT DEFAULT 'important' CHECK (question_type IN ('important', 'short', 'long', 'numerical')),
  marks INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTION PAPERS TABLE (PYQs)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.question_papers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  exam_year INTEGER NOT NULL,
  exam_type TEXT DEFAULT 'annual' CHECK (exam_type IN ('annual', 'supplementary', 'mid_term', 'unit_test')),
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  download_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BOOKMARKS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('note', 'question', 'question_paper')),
  item_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- ============================================================
-- STUDY PROGRESS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.study_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, unit_id)
);

-- ============================================================
-- NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- UPLOAD SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.upload_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submitted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  semester_id UUID REFERENCES public.semesters(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  submission_type TEXT NOT NULL CHECK (submission_type IN ('note', 'question', 'question_paper')),
  category TEXT CHECK (category IN ('handwritten', 'university', 'shivani')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RECENTLY VIEWED TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('note', 'question_paper', 'subject')),
  item_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notes_unit_id ON public.notes(unit_id);
CREATE INDEX IF NOT EXISTS idx_notes_status ON public.notes(status);
CREATE INDEX IF NOT EXISTS idx_notes_category ON public.notes(category);
CREATE INDEX IF NOT EXISTS idx_questions_unit_id ON public.questions(unit_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_subject_id ON public.question_papers(subject_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_study_progress_user_id ON public.study_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_submissions_user_id ON public.upload_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_subjects_semester_id ON public.subjects(semester_id);
CREATE INDEX IF NOT EXISTS idx_units_subject_id ON public.units(subject_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_papers_updated_at BEFORE UPDATE ON public.question_papers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_upload_submissions_updated_at BEFORE UPDATE ON public.upload_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upload_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can view all profiles" ON public.profiles FOR SELECT USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Admin can update all profiles" ON public.profiles FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

-- Courses - public read, admin write
CREATE POLICY "Anyone authenticated can view active courses" ON public.courses FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);
CREATE POLICY "Admin can manage courses" ON public.courses FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Semesters - public read, admin write
CREATE POLICY "Anyone authenticated can view semesters" ON public.semesters FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);
CREATE POLICY "Admin can manage semesters" ON public.semesters FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Subjects - public read, admin write
CREATE POLICY "Anyone authenticated can view subjects" ON public.subjects FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);
CREATE POLICY "Admin can manage subjects" ON public.subjects FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Units - public read, admin write
CREATE POLICY "Anyone authenticated can view units" ON public.units FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);
CREATE POLICY "Admin can manage units" ON public.units FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Notes - approved notes visible to all, own notes visible, admin sees all
CREATE POLICY "Students can view approved notes" ON public.notes FOR SELECT USING (auth.role() = 'authenticated' AND status = 'approved' AND is_active = TRUE);
CREATE POLICY "Uploaders can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = uploaded_by);
CREATE POLICY "Faculty and students can upload notes" ON public.notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage all notes" ON public.notes FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Questions
CREATE POLICY "View approved questions" ON public.questions FOR SELECT USING (auth.role() = 'authenticated' AND status = 'approved' AND is_active = TRUE);
CREATE POLICY "Uploaders can view their own questions" ON public.questions FOR SELECT USING (auth.uid() = uploaded_by);
CREATE POLICY "Authenticated users can submit questions" ON public.questions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage all questions" ON public.questions FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Question Papers
CREATE POLICY "View approved question papers" ON public.question_papers FOR SELECT USING (auth.role() = 'authenticated' AND status = 'approved' AND is_active = TRUE);
CREATE POLICY "Uploaders can view their own papers" ON public.question_papers FOR SELECT USING (auth.uid() = uploaded_by);
CREATE POLICY "Authenticated users can submit papers" ON public.question_papers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can manage all papers" ON public.question_papers FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Bookmarks - users can manage their own
CREATE POLICY "Users can manage their own bookmarks" ON public.bookmarks FOR ALL USING (auth.uid() = user_id);

-- Study Progress
CREATE POLICY "Users can manage their own progress" ON public.study_progress FOR ALL USING (auth.uid() = user_id);

-- Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin can create notifications" ON public.notifications FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Upload Submissions
CREATE POLICY "Users can view their own submissions" ON public.upload_submissions FOR SELECT USING (auth.uid() = submitted_by);
CREATE POLICY "Users can create submissions" ON public.upload_submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Admin can manage all submissions" ON public.upload_submissions FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Recently Viewed
CREATE POLICY "Users can manage their own recently viewed" ON public.recently_viewed FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Insert B.Tech course
INSERT INTO public.courses (id, name, short_name, description, duration_years)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Bachelor of Technology', 'B.Tech', 'Undergraduate engineering degree program', 4)
ON CONFLICT DO NOTHING;

-- Insert 8 semesters for B.Tech
INSERT INTO public.semesters (id, course_id, number, name)
VALUES 
  ('21111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 1, 'Semester 1'),
  ('21111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 2, 'Semester 2'),
  ('21111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 3, 'Semester 3'),
  ('21111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 4, 'Semester 4'),
  ('21111111-1111-1111-1111-111111111115', '11111111-1111-1111-1111-111111111111', 5, 'Semester 5'),
  ('21111111-1111-1111-1111-111111111116', '11111111-1111-1111-1111-111111111111', 6, 'Semester 6'),
  ('21111111-1111-1111-1111-111111111117', '11111111-1111-1111-1111-111111111111', 7, 'Semester 7'),
  ('21111111-1111-1111-1111-111111111118', '11111111-1111-1111-1111-111111111111', 8, 'Semester 8')
ON CONFLICT DO NOTHING;

-- Insert Semester 1 subjects
INSERT INTO public.subjects (id, semester_id, name, short_name, subject_code, credits)
VALUES 
  ('31111111-1111-1111-1111-111111111111', '21111111-1111-1111-1111-111111111111', 'Engineering Chemistry', 'Chem', 'BT101', 4),
  ('31111111-1111-1111-1111-111111111112', '21111111-1111-1111-1111-111111111111', 'Mathematics-I', 'Math-I', 'BT102', 4),
  ('31111111-1111-1111-1111-111111111113', '21111111-1111-1111-1111-111111111111', 'Basic Electrical and Electronics Engineering', 'BEEE', 'BT103', 4),
  ('31111111-1111-1111-1111-111111111114', '21111111-1111-1111-1111-111111111111', 'English for Communication', 'English', 'BT104', 2),
  ('31111111-1111-1111-1111-111111111115', '21111111-1111-1111-1111-111111111111', 'Engineering Drawing', 'ED', 'BT105', 4)
ON CONFLICT DO NOTHING;

-- Insert Units for BEEE (5 units)
INSERT INTO public.units (id, subject_id, number, name)
VALUES 
  ('41111111-1111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111113', 1, 'DC Circuits and Network Theorems'),
  ('41111111-1111-1111-1111-111111111112', '31111111-1111-1111-1111-111111111113', 2, 'AC Circuits and Resonance'),
  ('41111111-1111-1111-1111-111111111113', '31111111-1111-1111-1111-111111111113', 3, 'Transformers and Electrical Machines'),
  ('41111111-1111-1111-1111-111111111114', '31111111-1111-1111-1111-111111111113', 4, 'Semiconductor Devices and Circuits'),
  ('41111111-1111-1111-1111-111111111115', '31111111-1111-1111-1111-111111111113', 5, 'Digital Electronics and Microprocessors')
ON CONFLICT DO NOTHING;

-- Insert Units for Engineering Chemistry (5 units)
INSERT INTO public.units (id, subject_id, number, name)
VALUES 
  ('41111111-2111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111111', 1, 'Atomic Structure and Chemical Bonding'),
  ('41111111-2111-1111-1111-111111111112', '31111111-1111-1111-1111-111111111111', 2, 'Thermodynamics and Chemical Equilibrium'),
  ('41111111-2111-1111-1111-111111111113', '31111111-1111-1111-1111-111111111111', 3, 'Electrochemistry and Corrosion'),
  ('41111111-2111-1111-1111-111111111114', '31111111-1111-1111-1111-111111111111', 4, 'Polymers and Composites'),
  ('41111111-2111-1111-1111-111111111115', '31111111-1111-1111-1111-111111111111', 5, 'Water Treatment and Fuels')
ON CONFLICT DO NOTHING;

-- Insert Units for Mathematics-I (5 units)
INSERT INTO public.units (id, subject_id, number, name)
VALUES 
  ('41111111-3111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111112', 1, 'Differential Calculus'),
  ('41111111-3111-1111-1111-111111111112', '31111111-1111-1111-1111-111111111112', 2, 'Integral Calculus'),
  ('41111111-3111-1111-1111-111111111113', '31111111-1111-1111-1111-111111111112', 3, 'Matrices and Linear Algebra'),
  ('41111111-3111-1111-1111-111111111114', '31111111-1111-1111-1111-111111111112', 4, 'Differential Equations'),
  ('41111111-3111-1111-1111-111111111115', '31111111-1111-1111-1111-111111111112', 5, 'Vector Calculus and Complex Numbers')
ON CONFLICT DO NOTHING;

-- Insert Units for English for Communication (4 units)
INSERT INTO public.units (id, subject_id, number, name)
VALUES 
  ('41111111-4111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111114', 1, 'Reading and Comprehension Skills'),
  ('41111111-4111-1111-1111-111111111112', '31111111-1111-1111-1111-111111111114', 2, 'Writing Skills and Technical Writing'),
  ('41111111-4111-1111-1111-111111111113', '31111111-1111-1111-1111-111111111114', 3, 'Speaking and Presentation Skills'),
  ('41111111-4111-1111-1111-111111111114', '31111111-1111-1111-1111-111111111114', 4, 'Grammar and Vocabulary')
ON CONFLICT DO NOTHING;

-- Insert Units for Engineering Drawing (5 units)
INSERT INTO public.units (id, subject_id, number, name)
VALUES 
  ('41111111-5111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111115', 1, 'Introduction to Engineering Drawing'),
  ('41111111-5111-1111-1111-111111111112', '31111111-1111-1111-1111-111111111115', 2, 'Projections of Points and Lines'),
  ('41111111-5111-1111-1111-111111111113', '31111111-1111-1111-1111-111111111115', 3, 'Projections of Planes and Solids'),
  ('41111111-5111-1111-1111-111111111114', '31111111-1111-1111-1111-111111111115', 4, 'Isometric and Orthographic Views'),
  ('41111111-5111-1111-1111-111111111115', '31111111-1111-1111-1111-111111111115', 5, 'Sectional Views and Development of Surfaces')
ON CONFLICT DO NOTHING;
