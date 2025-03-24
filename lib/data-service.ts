// lib/data-service.ts
import { createClient } from "./supabase/client";
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

export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type DepartmentInsert =
  Database["public"]["Tables"]["departments"]["Insert"];
export type DepartmentUpdate =
  Database["public"]["Tables"]["departments"]["Update"];

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationInsert =
  Database["public"]["Tables"]["organizations"]["Insert"];
export type OrganizationUpdate =
  Database["public"]["Tables"]["organizations"]["Update"];

export const getUserOrganizationId = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not found");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (error || !profile?.organization_id) {
    throw new Error("User not in an organization");
  }

  return profile.organization_id;
};

// Client-side data service
export const dataService = {
  // Organization Management
  getUserOrganization: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    // Get the user's profile to find their organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return { data: null, error: new Error("User not in an organization") };
    }

    // Get organization details
    return supabase
      .from("organizations")
      .select("*")
      .eq("id", profile.organization_id)
      .single();
  },

  createOrganization: async (name: string, slug: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    try {
      // Generate a random invite code
      const inviteCode = Math.random()
        .toString(36)
        .substring(2, 10)
        .toUpperCase();

      console.log("Creating organization with data:", {
        name,
        slug,
        inviteCode,
      });

      // Insert the organization using raw SQL to bypass RLS
      // Because RLS is causing infinite recursion
      const { data: organization, error: orgError } = await supabase.rpc(
        "create_organization_and_update_profile",
        {
          org_name: name,
          org_slug: slug,
          org_invite_code: inviteCode,
          user_id: user.id,
          timestamp: new Date().toISOString(),
        },
      );

      if (orgError) {
        console.error(
          "Error in create_organization_and_update_profile RPC:",
          JSON.stringify(orgError),
        );

        // Fallback method if RPC fails - direct table operations
        // (may still be subject to RLS issues)
        const { data: fallbackOrg, error: fallbackError } = await supabase
          .from("organizations")
          .insert({
            name,
            slug,
            invite_code: inviteCode,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (fallbackError) {
          console.error(
            "Fallback organization creation failed:",
            JSON.stringify(fallbackError),
          );
          return { data: null, error: fallbackError };
        }

        console.log("Organization created with fallback method:", fallbackOrg);

        // Now try to update the profile directly
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            organization_id: fallbackOrg.id,
            role: "dean",
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileError) {
          console.error(
            "Error updating profile:",
            JSON.stringify(profileError),
          );

          // Manually redirect to dashboard as a workaround
          window.location.href = "/dashboard";

          // Return partial success since org was created
          return {
            data: fallbackOrg,
            error: new Error(
              "Organization created but profile association failed",
            ),
          };
        }

        return { data: fallbackOrg, error: null };
      }

      console.log(
        "Organization created and profile updated via RPC:",
        organization,
      );

      // Even if the RPC succeeded, we might need to manually redirect
      if (organization) {
        window.location.href = "/dashboard";
      }

      return { data: organization, error: null };
    } catch (err) {
      console.error("Exception during organization creation:", err);
      return {
        data: null,
        error:
          err instanceof Error
            ? err
            : new Error("Unknown error during organization creation"),
      };
    }
  },

  joinOrganizationWithCode: async (inviteCode: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    // Find the organization with this invite code
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("*")
      .eq("invite_code", inviteCode)
      .single();

    if (orgError || !organization) {
      return {
        data: null,
        error: orgError || new Error("Invalid invite code"),
      };
    }

    // Update the user's profile to join the organization as a teacher (default role)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .update({
        organization_id: organization.id,
        role: "teacher", // Users join as teachers by default
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (profileError) {
      return { data: null, error: profileError };
    }

    return { data: profile, error: null };
  },

  generateNewInviteCode: async (organizationId: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    // Check if user is a dean
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "dean") {
      return {
        data: null,
        error: new Error("Only deans can generate invite codes"),
      };
    }

    // Generate a new random invite code
    const inviteCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    return supabase
      .from("organizations")
      .update({
        invite_code: inviteCode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organizationId)
      .select()
      .single();
  },

  // Profile Management
  getProfile: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    return supabase.from("profiles").select("*").eq("id", user.id).single();
  },

  updateProfile: async (profile: ProfileUpdate) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    return supabase
      .from("profiles")
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();
  },

  getAllProfiles: async () => {
    const supabase = createClient();
    return supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });
  },

  getTeachers: async () => {
    const supabase = createClient();
    return supabase
      .from("profiles")
      .select("*")
      .eq("role", "teacher")
      .order("full_name", { ascending: true });
  },

  // Course Management
  getCourses: async (userId?: string) => {
    const supabase = createClient();

    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error("User not found") };
      userId = user.id;
    }

    return supabase
      .from("courses")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
  },

  getAllCourses: async () => {
    const supabase = createClient();
    return supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
  },

  getCourseById: async (id: string) => {
    const supabase = createClient();
    return supabase.from("courses").select("*").eq("id", id).single();
  },

  createCourse: async (
    course: Omit<CourseInsert, "owner_id" | "created_at" | "updated_at">,
  ) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error("User not found") };

    return supabase
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
    const supabase = createClient();
    return supabase
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
    const supabase = createClient();
    return supabase.from("courses").delete().eq("id", id);
  },

  // Event Management
  getEvents: async (courseId: string) => {
    const supabase = createClient();
    return supabase
      .from("events")
      .select("*")
      .eq("course_id", courseId)
      .order("event_date", { ascending: false });
  },

  getAllEvents: async () => {
    const supabase = createClient();
    return supabase
      .from("events")
      .select("*, courses(name, code)")
      .order("event_date", { ascending: false });
  },

  getEventById: async (id: string) => {
    const supabase = createClient();
    return supabase
      .from("events")
      .select("*, courses(name, code, owner_id)")
      .eq("id", id)
      .single();
  },

  createEvent: async (
    event: Omit<
      EventInsert,
      | "positive_feedback_count"
      | "negative_feedback_count"
      | "neutral_feedback_count"
      | "total_feedback_count"
      | "created_at"
      | "updated_at"
    >,
  ) => {
    const supabase = createClient();
    return supabase
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
    const supabase = createClient();
    return supabase
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
    const supabase = createClient();
    return supabase.from("events").delete().eq("id", id);
  },

  generateEventCode: async (eventId: string) => {
    // Generate a random 6-character code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const supabase = createClient();
    return supabase
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
    const supabase = createClient();
    return supabase
      .from("events")
      .select("*, courses(name, code, owner_id)")
      .eq("entry_code", code)
      .single();
  },

  // Feedback Management
  getFeedbackByEventId: async (eventId: string) => {
    const supabase = createClient();
    return supabase
      .from("feedback")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
  },

  getFeedbackByCourseId: async (courseId: string) => {
    const supabase = createClient();
    return supabase
      .from("feedback")
      .select("*, events!inner(course_id)")
      .eq("events.course_id", courseId)
      .order("created_at", { ascending: false });
  },

  submitFeedback: async (
    feedback: Omit<FeedbackInsert, "is_reviewed" | "created_at">,
  ) => {
    const supabase = createClient();

    // Get the event to update share counts
    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", feedback.event_id)
      .single();

    if (!event) {
      return { data: null, error: new Error("Event not found") };
    }

    // Insert the share
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

    // Update the share counts on the event
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
    const supabase = createClient();
    return supabase
      .from("feedback")
      .update({
        is_reviewed: isReviewed,
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteFeedback: async (id: string) => {
    const supabase = createClient();

    // Get the share to update the event counts
    const { data: feedback } = await supabase
      .from("feedback")
      .select("*")
      .eq("id", id)
      .single();

    if (!feedback) {
      return { data: null, error: new Error("Feedback not found") };
    }

    // Get the event to update share counts
    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", feedback.event_id)
      .single();

    if (!event) {
      return { data: null, error: new Error("Event not found") };
    }

    // Delete the share
    const { data, error } = await supabase
      .from("feedback")
      .delete()
      .eq("id", id);

    if (error) return { data, error };

    // Update the share counts on the event
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
    const supabase = createClient();
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

    if (!events || events.length === 0) {
      return {
        totalFeedback: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        neutralFeedback: 0,
        positivePercentage: 0,
        negativePercentage: 0,
        neutralPercentage: 0,
        trendData: [],
      };
    }

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

  // Replace the getGlobalAnalytics function in your lib/data-service.ts file

  getGlobalAnalytics: async () => {
    const supabase = createClient();

    // Get courses count
    const { count: coursesCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    // Get events count
    const { count: eventsCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    // Get all feedback and calculate stats directly from feedback table (not from event counters)
    const { data: allFeedback, error: feedbackError } = await supabase
      .from("feedback")
      .select("id, tone, created_at, event_id");

    if (feedbackError) {
      console.error("Error fetching feedback:", feedbackError);
      return {
        coursesCount: coursesCount || 0,
        eventsCount: eventsCount || 0,
        feedbackCount: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        neutralFeedback: 0,
        positivePercentage: 0,
        negativePercentage: 0,
        neutralPercentage: 0,
        monthlyTrendData: [],
      };
    }

    // Count total feedback and breakdown by sentiment
    const totalFeedback = allFeedback ? allFeedback.length : 0;
    let positiveFeedback = 0;
    let negativeFeedback = 0;
    let neutralFeedback = 0;

    if (allFeedback && allFeedback.length > 0) {
      // Count by sentiment
      allFeedback.forEach((item) => {
        if (item.tone === "positive") positiveFeedback++;
        else if (item.tone === "negative") negativeFeedback++;
        else if (item.tone === "neutral") neutralFeedback++;
      });
    }

    // Calculate percentages
    const positivePercentage =
      totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;
    const negativePercentage =
      totalFeedback > 0 ? (negativeFeedback / totalFeedback) * 100 : 0;
    const neutralPercentage =
      totalFeedback > 0 ? (neutralFeedback / totalFeedback) * 100 : 0;

    // Group feedback by month
    // Group feedback by month
    interface MonthlyTrendItem {
      month: string;
      positive: number;
      negative: number;
      neutral: number;
      total: number;
    }

    const monthlyTrendData: Record<string, MonthlyTrendItem> = {};

    if (allFeedback && allFeedback.length > 0) {
      allFeedback.forEach((item) => {
        if (!item.created_at) return;

        const date = new Date(item.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyTrendData[monthYear]) {
          monthlyTrendData[monthYear] = {
            month: monthYear,
            positive: 0,
            negative: 0,
            neutral: 0,
            total: 0,
          };
        }

        // Increment total count
        monthlyTrendData[monthYear].total++;

        // Increment sentiment count
        if (item.tone === "positive") monthlyTrendData[monthYear].positive++;
        else if (item.tone === "negative")
          monthlyTrendData[monthYear].negative++;
        else if (item.tone === "neutral") monthlyTrendData[monthYear].neutral++;
      });
    }

    return {
      coursesCount: coursesCount || 0,
      eventsCount: eventsCount || 0,
      feedbackCount: totalFeedback,
      positiveFeedback,
      negativeFeedback,
      neutralFeedback,
      positivePercentage,
      negativePercentage,
      neutralPercentage,
      monthlyTrendData: Object.values(monthlyTrendData),
    };
  },

  // Add these functions to the dataService object
  getDepartments: async () => {
    const supabase = createClient();
    return supabase
      .from("departments")
      .select("*")
      .order("name", { ascending: true });
  },

  createDepartment: async (
    department: Omit<DepartmentInsert, "created_at" | "updated_at">,
  ) => {
    const supabase = createClient();
    return supabase
      .from("departments")
      .insert({
        ...department,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
  },

  updateDepartment: async (id: string, department: DepartmentUpdate) => {
    const supabase = createClient();
    return supabase
      .from("departments")
      .update({
        ...department,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
  },

  deleteDepartment: async (id: string) => {
    const supabase = createClient();
    return supabase.from("departments").delete().eq("id", id);
  },
};
