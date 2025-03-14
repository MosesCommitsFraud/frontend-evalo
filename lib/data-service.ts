// lib/data-service.ts
import { supabase } from "./supabase";
import { createServerClient } from "./supabase";
import { Database } from "@/types/supabase";

// Type definitions based on the database schema
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
export type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"];

export type Event = Database["public"]["Tables"]["events"]["Row"];
export type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
export type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

export type Feedback = Database["public"]["Tables"]["feedback"]["Row"];
export type FeedbackInsert = Database["public"]["Tables"]["feedback"]["Insert"];
export type FeedbackUpdate = Database["public"]["Tables"]["feedback"]["Update"];

// Server-side data fetching functions
export const serverDataService = {
  // Profiles
  getProfile: async (userId: string) => {
    const supabase = createServerClient();
    return await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
  },

  // Courses
  getCourses: async (userId: string) => {
    const supabase = createServerClient();
    return await supabase
      .from("courses")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
  },

  getCourseById: async (id: string) => {
    const supabase = createServerClient();
    return await supabase.from("courses").select("*").eq("id", id).single();
  },

  // Events
  getEvents: async (courseId: string) => {
    const supabase = createServerClient();
    return await supabase
      .from("events")
      .select("*")
      .eq("course_id", courseId)
      .order("event_date", { ascending: false });
  },

  getEventById: async (id: string) => {
    const supabase = createServerClient();
    return await supabase.from("events").select("*").eq("id", id).single();
  },

  // Feedback
  getFeedbackByEventId: async (eventId: string) => {
    const supabase = createServerClient();
    return await supabase
      .from("feedback")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
  },
};

// Client-side data service
export const dataService = {
  // Profile Management
  getProfile: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    return await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
  },

  updateProfile: async (profile: ProfileUpdate) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    return await supabase
      .from("profiles")
      .update(profile)
      .eq("id", user.id)
      .select()
      .single();
  },

  // Course Management
  getCourses: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    return await supabase
      .from("courses")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
  },

  getCourseById: async (id: string) => {
    return await supabase.from("courses").select("*").eq("id", id).single();
  },

  createCourse: async (course: Omit<CourseInsert, "owner_id">) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    return await supabase
      .from("courses")
      .insert({
        ...course,
        owner_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
  },

  updateCourse: async (id: string, course: CourseUpdate) => {
    return await supabase
      .from("courses")
      .update({
        ...course,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteCourse: async (id: string) => {
    return await supabase.from("courses").delete().eq("id", id);
  },

  // Event Management
  getEvents: async (courseId: string) => {
    return await supabase
      .from("events")
      .select("*")
      .eq("course_id", courseId)
      .order("event_date", { ascending: false });
  },

  getEventById: async (id: string) => {
    return await supabase.from("events").select("*").eq("id", id).single();
  },

  createEvent: async (
    event: Omit<
      EventInsert,
      | "positive_feedback_count"
      | "negative_feedback_count"
      | "neutral_feedback_count"
      | "total_feedback_count"
    >,
  ) => {
    return await supabase
      .from("events")
      .insert({
        ...event,
        positive_feedback_count: 0,
        negative_feedback_count: 0,
        neutral_feedback_count: 0,
        total_feedback_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
  },

  updateEvent: async (id: string, event: EventUpdate) => {
    return await supabase
      .from("events")
      .update({
        ...event,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteEvent: async (id: string) => {
    return await supabase.from("events").delete().eq("id", id);
  },

  generateEventCode: async (eventId: string) => {
    // Generate a random 6-character code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return await supabase
      .from("events")
      .update({
        entry_code: code,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .select()
      .single();
  },

  getEventByCode: async (code: string) => {
    return await supabase
      .from("events")
      .select("*, courses(*)")
      .eq("entry_code", code)
      .single();
  },

  // Feedback Management
  getFeedbackByEventId: async (eventId: string) => {
    return await supabase
      .from("feedback")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
  },

  submitFeedback: async (feedback: FeedbackInsert) => {
    // Get the event to update feedback counts
    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", feedback.event_id)
      .single();

    if (!event) {
      return { data: null, error: new Error("Event not found") };
    }

    // Start a transaction to update both feedback and event
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        ...feedback,
        is_reviewed: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { data, error };

    // Update the feedback counts on the event
    let positive_feedback_count = event.positive_feedback_count || 0;
    let negative_feedback_count = event.negative_feedback_count || 0;
    let neutral_feedback_count = event.neutral_feedback_count || 0;
    let total_feedback_count = event.total_feedback_count || 0;

    if (feedback.tone === "positive") positive_feedback_count += 1;
    if (feedback.tone === "negative") negative_feedback_count += 1;
    if (feedback.tone === "neutral") neutral_feedback_count += 1;
    total_feedback_count += 1;

    await supabase
      .from("events")
      .update({
        positive_feedback_count,
        negative_feedback_count,
        neutral_feedback_count,
        total_feedback_count,
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedback.event_id);

    return { data, error };
  },

  updateFeedbackReviewStatus: async (id: string, isReviewed: boolean) => {
    return await supabase
      .from("feedback")
      .update({
        is_reviewed: isReviewed,
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteFeedback: async (id: string) => {
    // Get the feedback to update the event counts
    const { data: feedback } = await supabase
      .from("feedback")
      .select("*")
      .eq("id", id)
      .single();

    if (!feedback) {
      return { data: null, error: new Error("Feedback not found") };
    }

    // Get the event to update feedback counts
    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", feedback.event_id)
      .single();

    if (!event) {
      return { data: null, error: new Error("Event not found") };
    }

    // Delete the feedback
    const { data, error } = await supabase
      .from("feedback")
      .delete()
      .eq("id", id);

    if (error) return { data, error };

    // Update the feedback counts on the event
    let positive_feedback_count = event.positive_feedback_count || 0;
    let negative_feedback_count = event.negative_feedback_count || 0;
    let neutral_feedback_count = event.neutral_feedback_count || 0;
    let total_feedback_count = event.total_feedback_count || 0;

    if (feedback.tone === "positive" && positive_feedback_count > 0)
      positive_feedback_count -= 1;
    if (feedback.tone === "negative" && negative_feedback_count > 0)
      negative_feedback_count -= 1;
    if (feedback.tone === "neutral" && neutral_feedback_count > 0)
      neutral_feedback_count -= 1;
    if (total_feedback_count > 0) total_feedback_count -= 1;

    await supabase
      .from("events")
      .update({
        positive_feedback_count,
        negative_feedback_count,
        neutral_feedback_count,
        total_feedback_count,
        updated_at: new Date().toISOString(),
      })
      .eq("id", feedback.event_id);

    return { data, error };
  },

  // Analytics helpers
  getCourseSummaryStats: async (courseId: string) => {
    const { data: events } = await supabase
      .from("events")
      .select(
        `
        id,
        event_date,
        positive_feedback_count,
        negative_feedback_count,
        neutral_feedback_count,
        total_feedback_count
      `,
      )
      .eq("course_id", courseId)
      .order("event_date", { ascending: true });

    if (!events) return null;

    // Calculate summary stats
    const totalFeedback = events.reduce(
      (sum, event) => sum + (event.total_feedback_count || 0),
      0,
    );
    const positiveFeedback = events.reduce(
      (sum, event) => sum + (event.positive_feedback_count || 0),
      0,
    );
    const negativeFeedback = events.reduce(
      (sum, event) => sum + (event.negative_feedback_count || 0),
      0,
    );
    const neutralFeedback = events.reduce(
      (sum, event) => sum + (event.neutral_feedback_count || 0),
      0,
    );

    const positivePercentage =
      totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;
    const negativePercentage =
      totalFeedback > 0 ? (negativeFeedback / totalFeedback) * 100 : 0;
    const neutralPercentage =
      totalFeedback > 0 ? (neutralFeedback / totalFeedback) * 100 : 0;

    // Format data for charts
    const trendData = events.map((event) => ({
      date: new Date(event.event_date).toLocaleDateString(),
      positive: event.positive_feedback_count || 0,
      negative: event.negative_feedback_count || 0,
      neutral: event.neutral_feedback_count || 0,
      total: event.total_feedback_count || 0,
    }));

    return {
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      neutralFeedback,
      positivePercentage,
      negativePercentage,
      neutralPercentage,
      trendData,
    };
  },
};
