"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomTabs from "@/components/custom-tabs";
import {
  Activity,
  Calendar,
  Clock,
  BarChart,
  Users,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Define proper TypeScript interfaces
interface CourseType {
  id: string;
  name: string;
  code: string;
  student_count?: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string | null;
  };
}

interface StatsType {
  totalCourses: number;
  totalStudents: number;
  responseRate: number;
  avgSentiment: number;
}

interface FormattedEventType {
  id: string;
  title: string;
  course: string;
  time: string;
}

interface FormattedFeedbackType {
  id: string;
  course: string;
  content: string;
  sentiment: string;
  time: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // State for real data with proper typing
  const [userRole, setUserRole] = useState<string>("");
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<FormattedEventType[]>(
    [],
  );
  const [recentFeedback, setRecentFeedback] = useState<FormattedFeedbackType[]>(
    [],
  );
  const [stats, setStats] = useState<StatsType>({
    totalCourses: 0,
    totalStudents: 0,
    responseRate: 0,
    avgSentiment: 0,
  });

  // Fetch data when component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError("");

      try {
        const supabase = createClient();

        // Get user role first
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          throw new Error("Could not determine user role");
        }

        setUserRole(profileData?.role || "teacher");
        const isDean = profileData?.role === "dean";

        // Fetch courses - all courses for dean, just owned courses for teachers
        const coursesQuery = supabase
          .from("courses")
          .select("*, profiles(full_name)")
          .order("created_at", { ascending: false });

        // If not dean, filter to only show own courses
        if (!isDean) {
          coursesQuery.eq("owner_id", user.id);
        }

        const { data: coursesData, error: coursesError } = await coursesQuery;

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw new Error("Failed to load courses");
        }

        setCourses(coursesData || []);

        // Calculate total students
        const totalStudents = (coursesData || []).reduce(
          (sum, course) => sum + (course.student_count || 0),
          0,
        );

        // Get course IDs for events and feedback queries
        const courseIds = (coursesData || []).map((course) => course.id);

        // Only proceed if we have courses
        if (courseIds.length > 0) {
          // Fetch upcoming events
          const now = new Date().toISOString();
          const { data: eventsData, error: eventsError } = await supabase
            .from("events")
            .select("id, event_date, course_id, courses:course_id(name, code)")
            .in("course_id", courseIds)
            .gt("event_date", now)
            .order("event_date", { ascending: true })
            .limit(4);

          if (eventsError) {
            console.error("Error fetching events:", eventsError);
          } else {
            // Format events for display
            const formattedEvents = (eventsData || []).map((event: any) => ({
              id: event.id,
              title: event.courses ? event.courses.name : "Unknown Course",
              course: event.courses ? event.courses.code : "Unknown",
              time: formatEventDate(event.event_date),
            }));

            setUpcomingEvents(formattedEvents);
          }

          // Fetch recent feedback
          const { data: feedbackData, error: feedbackError } = await supabase
            .from("feedback")
            .select(
              `
              id, 
              content, 
              tone, 
              created_at, 
              events:event_id!inner(
                course_id, 
                courses:course_id(name, code)
              )
            `,
            )
            .in("events.course_id", courseIds)
            .order("created_at", { ascending: false })
            .limit(3);

          if (feedbackError) {
            console.error("Error fetching feedback:", feedbackError);
          } else {
            // Format feedback for display
            const formattedFeedback = (feedbackData || []).map((item: any) => ({
              id: item.id,
              course:
                item.events && item.events.courses
                  ? item.events.courses.code
                  : "Unknown",
              content: item.content,
              sentiment: item.tone,
              time: formatRelativeTime(item.created_at),
            }));

            setRecentFeedback(formattedFeedback);
          }

          // Calculate stats
          let totalFeedback = 0;
          let positiveFeedback = 0;

          const { data: statsData, error: statsError } = await supabase
            .from("events")
            .select("total_feedback_count, positive_feedback_count")
            .in("course_id", courseIds);

          if (!statsError && statsData) {
            totalFeedback = statsData.reduce(
              (sum, event) => sum + (event.total_feedback_count || 0),
              0,
            );

            positiveFeedback = statsData.reduce(
              (sum, event) => sum + (event.positive_feedback_count || 0),
              0,
            );
          }

          // Calculate response rate and sentiment
          const totalPossibleResponses =
            (coursesData || []).reduce(
              (sum, course) => sum + (course.student_count || 0),
              0,
            ) * (statsData?.length || 0 || 1);

          const responseRate =
            totalPossibleResponses > 0
              ? Math.round((totalFeedback / totalPossibleResponses) * 100)
              : 0;

          const avgSentiment =
            totalFeedback > 0
              ? Math.round((positiveFeedback / totalFeedback) * 100)
              : 0;

          setStats({
            totalCourses: coursesData?.length || 0,
            totalStudents,
            responseRate,
            avgSentiment,
          });
        }
      } catch (err) {
        console.error("Error:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Format date for display
  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();

    // Check if the event is today
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    // Check if the event is tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    // Otherwise, show the full date
    return date.toLocaleString([], {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format relative time for feedback
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <span className="ml-2 text-lg">Loading dashboard data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Error Loading Dashboard
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Build tab for Upcoming Events
  const upcomingTab = {
    label: "Upcoming Events",
    content: (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your scheduled events for this week</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No upcoming events scheduled
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center">
                  <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.course}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center">
                    <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      {event.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    ),
  };

  // Build tab for Recent Feedback
  const feedbackTab = {
    label: "Recent Feedback",
    content: (
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>
            Latest student feedback across{" "}
            {userRole === "dean" ? "all" : "your"} courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentFeedback.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No feedback received yet
            </div>
          ) : (
            <div className="space-y-4">
              {recentFeedback.map((item) => (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center">
                    <span
                      className={`mr-2 h-2 w-2 rounded-full ${
                        item.sentiment === "positive"
                          ? "bg-emerald-500"
                          : item.sentiment === "negative"
                            ? "bg-red-500"
                            : "bg-gray-500"
                      }`}
                    />
                    <p className="text-sm font-medium">{item.course}</p>
                    <p className="ml-auto text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                  <p className="text-sm">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    ),
  };

  // Combine tab data into an array
  const tabsData = [upcomingTab, feedbackTab];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "dean" ? "Total Courses" : "Your Courses"}
            </CardTitle>
            <BookIcon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active courses{" "}
              {userRole === "dean" ? "in the system" : "this semester"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled across {userRole === "dean" ? "all" : "your"} courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Average student participation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Sentiment
            </CardTitle>
            <BarChart className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSentiment}%</div>
            <p className="text-xs text-muted-foreground">Positive feedback</p>
          </CardContent>
        </Card>
      </div>

      {/* Use the custom tabs component */}
      <CustomTabs tabs={tabsData} />

      {/* Course list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {userRole === "dean" ? "All Courses" : "Your Courses"}
          </CardTitle>
          <CardDescription>
            {userRole === "dean"
              ? "All courses in the system"
              : "Courses you're currently teaching"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No courses found
            </div>
          ) : (
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                      {course.code?.substring(0, 2) || "??"}
                    </div>
                    <div>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <span>{course.code}</span>
                        {userRole === "dean" && course.profiles?.full_name && (
                          <span>• {course.profiles.full_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/courses/${course.id}`}>View</Link>
                  </Button>
                </div>
              ))}

              {courses.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/courses">View All Courses</Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// BookIcon component used in the dashboard cards
const BookIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
