export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'student' | 'faculty' | 'admin'
          avatar_url: string | null
          phone: string | null
          department: string | null
          year_of_study: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role?: 'student' | 'faculty' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          department?: string | null
          year_of_study?: number | null
        }
        Update: {
          full_name?: string
          email?: string
          role?: 'student' | 'faculty' | 'admin'
          avatar_url?: string | null
          phone?: string | null
          department?: string | null
          year_of_study?: number | null
        }
      }
      courses: {
        Row: {
          id: string
          name: string
          short_name: string
          description: string | null
          duration_years: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name: string
          description?: string | null
          duration_years?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          short_name?: string
          description?: string | null
          duration_years?: number
          is_active?: boolean
        }
      }
      semesters: {
        Row: {
          id: string
          course_id: string
          number: number
          name: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          number: number
          name: string
          is_active?: boolean
        }
        Update: {
          number?: number
          name?: string
          is_active?: boolean
        }
      }
      subjects: {
        Row: {
          id: string
          semester_id: string
          name: string
          short_name: string | null
          subject_code: string | null
          description: string | null
          credits: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          semester_id: string
          name: string
          short_name?: string | null
          subject_code?: string | null
          description?: string | null
          credits?: number
          is_active?: boolean
        }
        Update: {
          name?: string
          short_name?: string | null
          subject_code?: string | null
          description?: string | null
          credits?: number
          is_active?: boolean
        }
      }
      units: {
        Row: {
          id: string
          subject_id: string
          number: number
          name: string
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          number: number
          name: string
          description?: string | null
          is_active?: boolean
        }
        Update: {
          number?: number
          name?: string
          description?: string | null
          is_active?: boolean
        }
      }
      notes: {
        Row: {
          id: string
          unit_id: string
          title: string
          description: string | null
          category: 'handwritten' | 'university' | 'shivani'
          subcategory: 'faculty' | 'student' | null
          file_url: string | null
          file_name: string | null
          file_size: number | null
          uploaded_by: string | null
          status: 'pending' | 'approved' | 'rejected'
          rejection_reason: string | null
          view_count: number
          download_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          title: string
          description?: string | null
          category: 'handwritten' | 'university' | 'shivani'
          subcategory?: 'faculty' | 'student' | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          uploaded_by?: string | null
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          title?: string
          description?: string | null
          category?: 'handwritten' | 'university' | 'shivani'
          subcategory?: 'faculty' | 'student' | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          status?: 'pending' | 'approved' | 'rejected'
          rejection_reason?: string | null
          view_count?: number
          download_count?: number
          is_active?: boolean
        }
      }
      questions: {
        Row: {
          id: string
          unit_id: string
          question_text: string
          answer_text: string | null
          question_type: 'important' | 'short' | 'long' | 'numerical'
          marks: number | null
          uploaded_by: string | null
          status: 'pending' | 'approved' | 'rejected'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          unit_id: string
          question_text: string
          answer_text?: string | null
          question_type?: 'important' | 'short' | 'long' | 'numerical'
          marks?: number | null
          uploaded_by?: string | null
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          question_text?: string
          answer_text?: string | null
          question_type?: 'important' | 'short' | 'long' | 'numerical'
          marks?: number | null
          status?: 'pending' | 'approved' | 'rejected'
          is_active?: boolean
        }
      }
      question_papers: {
        Row: {
          id: string
          subject_id: string
          title: string
          exam_year: number
          exam_type: 'annual' | 'supplementary' | 'mid_term' | 'unit_test'
          file_url: string | null
          file_name: string | null
          file_size: number | null
          uploaded_by: string | null
          status: 'pending' | 'approved' | 'rejected'
          download_count: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          subject_id: string
          title: string
          exam_year: number
          exam_type?: 'annual' | 'supplementary' | 'mid_term' | 'unit_test'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          uploaded_by?: string | null
          status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          title?: string
          exam_year?: number
          exam_type?: 'annual' | 'supplementary' | 'mid_term' | 'unit_test'
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
          status?: 'pending' | 'approved' | 'rejected'
          download_count?: number
          is_active?: boolean
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          item_type: 'note' | 'question' | 'question_paper'
          item_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: 'note' | 'question' | 'question_paper'
          item_id: string
        }
        Update: never
      }
      study_progress: {
        Row: {
          id: string
          user_id: string
          unit_id: string
          status: 'not_started' | 'in_progress' | 'completed'
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          unit_id: string
          status?: 'not_started' | 'in_progress' | 'completed'
        }
        Update: {
          status?: 'not_started' | 'in_progress' | 'completed'
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          is_read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          link?: string | null
        }
        Update: {
          is_read?: boolean
        }
      }
      upload_submissions: {
        Row: {
          id: string
          submitted_by: string
          course_id: string | null
          semester_id: string | null
          subject_id: string | null
          unit_id: string | null
          submission_type: 'note' | 'question' | 'question_paper'
          category: 'handwritten' | 'university' | 'shivani' | null
          title: string
          description: string | null
          file_url: string | null
          file_name: string | null
          file_size: number | null
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          submitted_by: string
          course_id?: string | null
          semester_id?: string | null
          subject_id?: string | null
          unit_id?: string | null
          submission_type: 'note' | 'question' | 'question_paper'
          category?: 'handwritten' | 'university' | 'shivani' | null
          title: string
          description?: string | null
          file_url?: string | null
          file_name?: string | null
          file_size?: number | null
        }
        Update: {
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          rejection_reason?: string | null
        }
      }
      recently_viewed: {
        Row: {
          id: string
          user_id: string
          item_type: 'note' | 'question_paper' | 'subject'
          item_id: string
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: 'note' | 'question_paper' | 'subject'
          item_id: string
        }
        Update: {
          viewed_at?: string
        }
      }
    }
    Views: {}
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {}
  }
}
