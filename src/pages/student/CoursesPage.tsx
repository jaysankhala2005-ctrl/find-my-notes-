import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ChevronRight, BookOpen, Clock, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isSupabaseConfigured } from '../../lib/supabase'
import { Skeleton } from '../../components/ui/Skeleton'

const DEMO_COURSES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Bachelor of Technology',
    short_name: 'B.Tech',
    description: 'Undergraduate engineering degree program',
    duration_years: 4,
    semesterCount: 8,
    studentCount: '2000+',
    color: 'gradient-brand',
    emoji: '🎓',
  },
]

const COMING_SOON_COURSES = [
  { name: 'BCA', fullName: 'Bachelor of Computer Applications', emoji: '💻' },
  { name: 'MCA', fullName: 'Master of Computer Applications', emoji: '🖥️' },
  { name: 'M.Tech', fullName: 'Master of Technology', emoji: '⚙️' },
  { name: 'MBA', fullName: 'Master of Business Administration', emoji: '📊' },
]

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchCourses()
    } else {
      setCourses(DEMO_COURSES)
      setLoading(false)
    }
  }, [])

  const fetchCourses = async () => {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('name')
    setCourses(data ?? DEMO_COURSES)
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white font-display flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-brand-500" />
            Select Your Course
          </h1>
          <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">
            Choose your course to access study materials
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-navy-500">
        <Link to="/dashboard" className="hover:text-brand-600 transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-700 dark:text-navy-300 font-medium">Courses</span>
      </nav>

      {/* Active Courses */}
      <div>
        <h2 className="text-lg font-semibold text-navy-800 dark:text-navy-200 mb-4">
          Available Courses
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course, i) => (
              <Link
                key={course.id}
                to={`/course/${course.id}/semesters`}
                className="card p-6 flex flex-col gap-4 group card-hover-effect animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${course.color ?? 'gradient-brand'} flex items-center justify-center text-2xl flex-shrink-0`}>
                    {course.emoji ?? '🎓'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="badge badge-blue">{course.short_name}</span>
                      <span className="text-xs text-navy-400">{course.duration_years} Years</span>
                    </div>
                    <h3 className="font-bold text-navy-900 dark:text-white text-lg mt-1 font-display">
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="text-navy-500 dark:text-navy-400 text-sm mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-navy-100 dark:border-navy-700">
                  <div className="flex items-center gap-4 text-sm text-navy-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.semesterCount ?? 8} Semesters
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.studentCount ?? '1000+'} Students
                    </span>
                  </div>
                  <span className="btn btn-primary btn-sm group-hover:shadow-lg transition-all">
                    Select <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Coming Soon */}
      <div>
        <h2 className="text-lg font-semibold text-navy-800 dark:text-navy-200 mb-4">
          Coming Soon
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COMING_SOON_COURSES.map((course, i) => (
            <div
              key={i}
              className="card p-4 text-center opacity-60 cursor-not-allowed animate-fade-in-up"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="text-3xl mb-2">{course.emoji}</div>
              <div className="font-bold text-navy-700 dark:text-navy-300 text-sm">{course.name}</div>
              <div className="text-xs text-navy-400 mt-1 line-clamp-1">{course.fullName}</div>
              <span className="badge badge-gray mt-2">Coming Soon</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
