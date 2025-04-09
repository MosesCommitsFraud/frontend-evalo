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
          bio: string | null;
          avatar_url: string | null;
          organization_id: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: "teacher" | "dean";
          created_at?: string;
          updated_at?: string;
          department?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          organization_id?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: "teacher" | "dean";
          created_at?: string;
          updated_at?: string;
          department?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          organization_id?: string | null;
        };
      };
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
          teacher: string | null;
          organization_id: string;
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
          teacher?: string | null;
          organization_id: string;
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
          teacher?: string | null;
          organization_id?: string;
        };
      };
      events: {
        Row: {
          id: string;
          course_id: string;
          event_date: string; // This already includes start date AND time
          event_name: string | null; // Add event_name field
          end_time: string | null; // Add end_time field for duration
          status: "open" | "closed" | "archived";
          entry_code: string | null;
          created_at: string;
          updated_at: string;
          positive_feedback_count: number;
          negative_feedback_count: number;
          neutral_feedback_count: number;
          total_feedback_count: number;
          organization_id: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          event_date: string; // Start date and time
          event_name?: string | null;
          end_time?: string | null;
          status?: "open" | "closed" | "archived";
          entry_code?: string | null;
          created_at?: string;
          updated_at?: string;
          positive_feedback_count?: number;
          negative_feedback_count?: number;
          neutral_feedback_count?: number;
          total_feedback_count?: number;
          organization_id: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          event_date?: string;
          event_name?: string | null;
          end_time?: string | null;
          status?: "open" | "closed" | "archived";
          entry_code?: string | null;
          created_at?: string;
          updated_at?: string;
          positive_feedback_count?: number;
          negative_feedback_count?: number;
          neutral_feedback_count?: number;
          total_feedback_count?: number;
          organization_id?: string;
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
          is_seen: boolean; // Add this field
          created_at: string;
          organization_id: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          student_name?: string | null;
          content: string;
          tone: "positive" | "negative" | "neutral";
          is_reviewed?: boolean;
          is_seen?: boolean; // Add this field
          created_at?: string;
          organization_id: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          student_name?: string | null;
          content?: string;
          tone?: "positive" | "negative" | "neutral";
          is_reviewed?: boolean;
          is_seen?: boolean; // Add this field
          created_at?: string;
          organization_id?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          created_at: string;
          updated_at: string;
          organization_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          created_at?: string;
          updated_at?: string;
          organization_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          created_at?: string;
          updated_at?: string;
          organization_id?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          invite_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          invite_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          invite_code?: string | null;
          created_at?: string;
          updated_at?: string;
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
