import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './providers/AuthProvider'
import { AppLayout } from './components/layout/AppLayout'
import { PublicRoute, ProtectedRoute } from './components/routing/ProtectedRoute'
import { LoginPage } from './pages/auth/LoginPage'
import { SignupPage } from './pages/auth/SignupPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { FacultyDashboard } from './pages/faculty/FacultyDashboard'
import { StudentDashboard } from './pages/student/StudentDashboard'
import { BookmarksPage } from './pages/student/BookmarksPage'
import { CoursesPage } from './pages/student/CoursesPage'
import { NotesListPage } from './pages/student/NotesListPage'
import { PYQPage } from './pages/student/PYQPage'
import { SearchPage } from './pages/student/SearchPage'
import { SemestersPage } from './pages/student/SemestersPage'
import { SubjectsPage } from './pages/student/SubjectsPage'
import { SubjectDetailPage } from './pages/student/SubjectDetailPage'
import { StudyProgressPage } from './pages/student/StudyProgressPage'
import { UploadPage } from './pages/student/UploadPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/progress" element={<StudyProgressPage />} />
            <Route path="/upload" element={<UploadPage />} />

            <Route path="/course/:courseId/semesters" element={<SemestersPage />} />
            <Route
              path="/course/:courseId/semester/:semesterId/subjects"
              element={<SubjectsPage />}
            />
            <Route path="/subject/:subjectId" element={<SubjectDetailPage />} />
            <Route
              path="/subject/:subjectId/notes/:category"
              element={<NotesListPage />}
            />
            <Route path="/subject/:subjectId/pyq" element={<PYQPage />} />

            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
