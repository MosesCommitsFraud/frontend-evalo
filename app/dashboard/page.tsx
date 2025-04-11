"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Book,
  Loader2,
  AlertTriangle,
  ThumbsUp,
  Minus,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Type definitions for our data
interface Course {
  id: string;
  name: string;
  code: string;
  student_count?: number;
  owner_id: string;
  profiles?: {
    full_name: string;
  };
}

interface Event {
  id: string;
  course_id: string;
  event_date: string;
  event_name?: string | null; // Add event_name field
  end_time?: string | null; // Add end_time field
  status: string;
  entry_code: string;
  created_at: string;
  updated_at: string;
  courses?: {
    name: string;
    code: string;
  };
}

interface Feedback {
  id: string;
  event_id: string;
  content: string;
  tone: "positive" | "negative" | "neutral";
  created_at: string;
  events?: {
    course_id: string;
  };
}

interface Stats {
  totalCourses: number;
  totalStudents: number;
  responseRate: number;
  avgSentiment: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for data
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCourses: 0,
    totalStudents: 0,
    responseRate: 0,
    avgSentiment: 0,
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Fetch all courses where the current user is the owner
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*")
          .eq("teacher", user.id)
          .order("created_at", { ascending: false });

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          setError("Failed to load your courses");
          return;
        }

        setCourses(coursesData || []);

        // Calculate total students
        const totalStudents = (coursesData || []).reduce(
          (sum, course) => sum + (course.student_count || 0),
          0,
        );

        // If no courses are found, set empty data and return early
        if (!coursesData || coursesData.length === 0) {
          setStats({
            totalCourses: 0,
            totalStudents: 0,
            responseRate: 0,
            avgSentiment: 0,
          });
          setIsLoading(false);
          return;
        }

        // Get course IDs for further queries
        const courseIds = coursesData.map((course) => course.id);

        // Fetch only events for the teacher's courses
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*, courses(name, code)")
          .in("course_id", courseIds)
          .order("created_at", { ascending: false });

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setError("Failed to load events for your courses");
          return;
        }

        setEvents(eventsData || []);

        // If there are no events, set empty feedback and return
        if (!eventsData || eventsData.length === 0) {
          setFeedback([]);

          // Set stats with available data
          setStats({
            totalCourses: coursesData.length,
            totalStudents,
            responseRate: 0,
            avgSentiment: 0,
          });

          setIsLoading(false);
          return;
        }

        // Get event IDs for feedback query
        const eventIds = eventsData.map((event) => event.id);

        // Fetch only feedback for the teacher's events
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("*, events(course_id)")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false });

        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError);
          setError("Failed to load feedback for your courses");
          return;
        }

        setFeedback(feedbackData || []);

        // Calculate statistics
        const totalFeedback = feedbackData?.length || 0;
        const positiveFeedback =
          feedbackData?.filter((f) => f.tone === "positive").length || 0;

        // Calculate response rate and sentiment
        const totalPossibleResponses =
          totalStudents * (eventsData?.length || 1);
        const responseRate =
          totalPossibleResponses > 0
            ? Math.round((totalFeedback / totalPossibleResponses) * 100)
            : 0;

        const avgSentiment =
          totalFeedback > 0
            ? Math.round((positiveFeedback / totalFeedback) * 100)
            : 0;

        // Set final stats
        setStats({
          totalCourses: coursesData.length,
          totalStudents,
          responseRate,
          avgSentiment,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An unexpected error occurred. Please refresh the page.");
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

  // Get upcoming events (next 7 days)
  const getUpcomingEvents = () => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    return events
      .filter((event) => {
        const eventDate = new Date(event.event_date);
        return eventDate >= now && eventDate <= nextWeek;
      })
      .sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
      )
      .slice(0, 4)
      .map((event) => ({
        id: event.id,
        title: event.courses?.name || "Unknown Course",
        course: event.courses?.code || "Unknown",
        time: formatEventDate(event.event_date),
      }));
  };

  const getRecentFeedback = () => {
    return feedback.slice(0, 3).map((item) => {
      // Find the corresponding event and course
      const event = events.find((e) => e.id === item.event_id);

      return {
        id: item.id,
        eventId: item.event_id,
        courseId: event?.course_id || "",
        course: event?.courses?.code || "Unknown",
        eventName:
          event?.event_name ||
          (event
            ? `Event (${new Date(event.event_date).toLocaleDateString()})`
            : "Unknown"),
        content: item.content,
        sentiment: item.tone,
        time: formatRelativeTime(item.created_at),
        eventDate: event?.event_date
          ? new Date(event.event_date).toLocaleDateString()
          : "",
        eventTime: event?.event_date
          ? new Date(event.event_date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        duration: event?.end_time ? getEventDuration(event) : "",
      };
    });
  };

  // Add the event duration helper function
  const getEventDuration = (event: Event): string => {
    try {
      if (event.event_date && event.end_time) {
        const startDate = new Date(event.event_date);
        const endDate = new Date(event.end_time);

        // Calculate duration in minutes
        const durationMs = endDate.getTime() - startDate.getTime();
        const durationMinutes = Math.floor(durationMs / 60000);

        if (durationMinutes < 60) {
          return `${durationMinutes} min`;
        } else {
          const hours = Math.floor(durationMinutes / 60);
          const minutes = durationMinutes % 60;
          return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
      }
      return "";
    } catch {
      return "";
    }
  };

  // Helper function to get appropriate sentiment icon
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-emerald-600" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
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

  // Get data for tabs
  const upcomingEvents = getUpcomingEvents();
  const recentFeedback = getRecentFeedback();

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

  const feedbackTab = {
    label: "Recent Feedback",
    content: (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>
            Latest student feedback across your courses
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 py-2">
          {recentFeedback.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No feedback received yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentFeedback.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-md p-3 hover:border-emerald-300 transition-colors cursor-pointer bg-card"
                  onClick={() => {
                    if (item.courseId && item.eventId) {
                      router.push(
                        `/dashboard/courses/${item.courseId}/events/${item.eventId}`,
                      );
                    }
                  }}
                >
                  {/* Course + Event Info */}
                  <div className="flex justify-between items-center text-xs mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-emerald-600" />
                      <span className="font-medium">{item.course}</span>
                      <span className="text-gray-400 mx-1">|</span>
                      <span className="text-muted-foreground max-w-[150px] truncate">
                        {item.eventName}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`inline-flex h-5 text-xs px-2 py-0 ${
                        item.sentiment === "positive"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : item.sentiment === "negative"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {getSentimentIcon(item.sentiment)}
                        <span>
                          {item.sentiment.charAt(0).toUpperCase() +
                            item.sentiment.slice(1)}
                        </span>
                      </span>
                    </Badge>
                  </div>

                  {/* Feedback Content */}
                  <div className="line-clamp-2 text-sm mb-1">
                    {item.content}
                  </div>

                  {/* Timestamp at bottom */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    <span>{item.time}</span>
                  </div>
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
            <CardTitle className="text-sm font-medium">Your Courses</CardTitle>
            <Book className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Active courses this semester
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
              Enrolled across your courses
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

      {/* Custom Tabs for Upcoming Events & Recent Feedback */}
      <CustomTabs tabs={tabsData} />

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            Courses you&#39;re currently teaching
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
                      <div className="text-sm text-muted-foreground">
                        {course.code} • {course.student_count || 0} students
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
