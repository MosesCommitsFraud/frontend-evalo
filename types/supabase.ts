// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: "teacher" | "dean";
          created_at: string;
          updated_at: string;
          department: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role: "teacher" | "dean";
          created_at?: string;
          updated_at?: string;
          department?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "teacher" | "dean";
          created_at?: string;
          updated_at?: string;
          department?: string | null;
        };
      };
      // Rest of the tables remain the same
      courses: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          code: string;
          student_count: number | null;
          created_at: string;
          updated_at: string;
          cycle: string | null;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          code: string;
          student_count?: number | null;
          created_at?: string;
          updated_at?: string;
          cycle?: string | null;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          code?: string;
          student_count?: number | null;
          created_at?: string;
          updated_at?: string;
          cycle?: string | null;
        };
      };
      events: {
        Row: {
          id: string;
          course_id: string;
          event_date: string;
          status: "open" | "closed" | "archived";
          entry_code: string | null;
          created_at: string;
          updated_at: string;
          positive_feedback_count: number;
          negative_feedback_count: number;
          neutral_feedback_count: number;
          total_feedback_count: number;
        };
        Insert: {
          id?: string;
          course_id: string;
          event_date: string;
          status?: "open" | "closed" | "archived";
          entry_code?: string | null;
          created_at?: string;
          updated_at?: string;
          positive_feedback_count?: number;
          negative_feedback_count?: number;
          neutral_feedback_count?: number;
          total_feedback_count?: number;
        };
        Update: {
          id?: string;
          course_id?: string;
          event_date?: string;
          status?: "open" | "closed" | "archived";
          entry_code?: string | null;
          created_at?: string;
          updated_at?: string;
          positive_feedback_count?: number;
          negative_feedback_count?: number;
          neutral_feedback_count?: number;
          total_feedback_count?: number;
        };
      };
      feedback: {
        Row: {
          id: string;
          event_id: string;
          student_name: string | null;
          content: string;
          tone: "positive" | "negative" | "neutral";
          is_reviewed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          student_name?: string | null;
          content: string;
          tone: "positive" | "negative" | "neutral";
          is_reviewed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          student_name?: string | null;
          content?: string;
          tone?: "positive" | "negative" | "neutral";
          is_reviewed?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
