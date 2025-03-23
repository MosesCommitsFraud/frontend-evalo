"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bar,
  BarChart,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomTabs from "@/components/custom-tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Book,
  Settings,
  Search,
  Filter,
  Calendar,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertTriangle,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { dataService } from "@/lib/data-service";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  status: string;
  entry_code: string;
  created_at: string;
  updated_at: string;
  positive_feedback_count: number;
  negative_feedback_count: number;
  neutral_feedback_count: number;
  total_feedback_count: number;
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
  is_reviewed: boolean;
  created_at: string;
  events?: {
    course_id: string;
  };
}

interface Analytics {
  coursesCount: number;
  eventsCount: number;
  feedbackCount: number;
  positiveFeedback: number;
  negativeFeedback: number;
  neutralFeedback: number;
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  monthlyTrendData: {
    month: string;
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  }[];
}

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // UI state
  const [timePeriod, setTimePeriod] = useState("30");
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  // Counter synchronization state
  const [isSyncingCounters, setIsSyncingCounters] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch global analytics
        const analyticsData = await dataService.getGlobalAnalytics();
        setAnalytics(analyticsData);

        // Fetch all courses
        const { data: coursesData, error: coursesError } =
          await dataService.getAllCourses();
        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw new Error("Failed to load courses data");
        }
        setCourses(coursesData || []);

        // Fetch all teachers
        const { data: teachersData, error: teachersError } =
          await dataService.getAllProfiles();
        if (teachersError) {
          console.error("Error fetching teachers:", teachersError);
          throw new Error("Failed to load teacher data");
        }
        setTeachers(teachersData?.filter((t) => t.role === "teacher") || []);

        // Fetch all events
        const supabase = createClient();
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*, courses(name, code)")
          .order("created_at", { ascending: false });

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          throw new Error("Failed to load event data");
        }
        setEvents(eventsData || []);

        // Fetch all feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("*, events!inner(course_id)")
          .order("created_at", { ascending: false });

        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError);
          throw new Error("Failed to load feedback data");
        }
        setFeedback(feedbackData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timePeriod]); // Refetch when time period changes

  // Set default active tab on component mount
  useEffect(() => {
    setActiveTab(0);
  }, []);

  // Function to synchronize feedback counters
  const syncFeedbackCounters = async () => {
    setIsSyncingCounters(true);
    setSyncResults(null);

    try {
      // Create a fresh Supabase client
      const supabase = createClient();

      // 1. Get all events
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select(
          "id, total_feedback_count, positive_feedback_count, negative_feedback_count, neutral_feedback_count",
        );

      if (eventsError) {
        throw new Error(`Error fetching events: ${eventsError.message}`);
      }

      // 2. Get all feedback
      const { data: allFeedback, error: feedbackError } = await supabase
        .from("feedback")
        .select("id, event_id, tone");

      if (feedbackError) {
        throw new Error(`Error fetching feedback: ${feedbackError.message}`);
      }

      // 3. Calculate actual feedback counts per event
      const feedbackCounts: Record<string, number> = {};
      const sentimentCounts: Record<
        string,
        { positive: number; negative: number; neutral: number }
      > = {};

      // Initialize counters for all events (even those with zero feedback)
      events.forEach((event) => {
        feedbackCounts[event.id] = 0;
        sentimentCounts[event.id] = { positive: 0, negative: 0, neutral: 0 };
      });

      // Count feedback by event and sentiment
      allFeedback.forEach((item) => {
        if (feedbackCounts[item.event_id] !== undefined) {
          // Increment total count
          feedbackCounts[item.event_id]++;

          // Increment sentiment count
          if (item.tone === "positive")
            sentimentCounts[item.event_id].positive++;
          else if (item.tone === "negative")
            sentimentCounts[item.event_id].negative++;
          else if (item.tone === "neutral")
            sentimentCounts[item.event_id].neutral++;
        }
      });

      // 4. Identify events with incorrect counters
      const eventsToFix = events.filter(
        (event) =>
          event.total_feedback_count !== feedbackCounts[event.id] ||
          event.positive_feedback_count !==
            sentimentCounts[event.id].positive ||
          event.negative_feedback_count !==
            sentimentCounts[event.id].negative ||
          event.neutral_feedback_count !== sentimentCounts[event.id].neutral,
      );

      // 5. Fix the counters
      let fixedCount = 0;
      const fixedEvents = [];

      for (const event of eventsToFix) {
        const { error: updateError } = await supabase
          .from("events")
          .update({
            total_feedback_count: feedbackCounts[event.id],
            positive_feedback_count: sentimentCounts[event.id].positive,
            negative_feedback_count: sentimentCounts[event.id].negative,
            neutral_feedback_count: sentimentCounts[event.id].neutral,
            updated_at: new Date().toISOString(),
          })
          .eq("id", event.id);

        if (updateError) {
          console.error(`Error updating event ${event.id}:`, updateError);
          fixedEvents.push({
            id: event.id,
            success: false,
            error: updateError.message,
          });
        } else {
          fixedCount++;
          fixedEvents.push({
            id: event.id,
            success: true,
            before: {
              total: event.total_feedback_count,
              positive: event.positive_feedback_count,
              negative: event.negative_feedback_count,
              neutral: event.neutral_feedback_count,
            },
            after: {
              total: feedbackCounts[event.id],
              positive: sentimentCounts[event.id].positive,
              negative: sentimentCounts[event.id].negative,
              neutral: sentimentCounts[event.id].neutral,
            },
          });
        }
      }

      // Save results for display
      const results = {
        totalEvents: events.length,
        totalFeedback: allFeedback.length,
        eventsNeedingFix: eventsToFix.length,
        eventsFixed: fixedCount,
        details: fixedEvents,
      };

      setSyncResults(results);
      setShowSyncDialog(true);

      // If we fixed any events, refresh analytics data
      if (fixedCount > 0) {
        toast({
          title: "Counters Synchronized",
          description: `Fixed counters for ${fixedCount} events. Refreshing data...`,
        });

        // Fetch updated global analytics
        const analyticsData = await dataService.getGlobalAnalytics();
        setAnalytics(analyticsData);
      } else {
        toast({
          title: "Counters Synchronized",
          description: "All feedback counters are already correct.",
        });
      }
    } catch (error) {
      console.error("Error syncing feedback counters:", error);
      toast({
        title: "Error",
        description:
          "Failed to synchronize feedback counters. See console for details.",
      });
    } finally {
      setIsSyncingCounters(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Format relative time for feedback
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

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

  // Get sentiment icon based on sentiment
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

  // Format data for charts
  const formatCourseActivityData = () => {
    if (
      !analytics?.monthlyTrendData ||
      analytics.monthlyTrendData.length === 0
    ) {
      // Return sample data if no data is available
      return [
        { month: "Jan", responses: 0, feedback: 0 },
        { month: "Feb", responses: 0, feedback: 0 },
        { month: "Mar", responses: 0, feedback: 0 },
      ];
    }

    return analytics.monthlyTrendData.map((item) => ({
      month: formatMonth(item.month),
      responses: item.total,
      feedback: item.positive + item.negative + item.neutral,
    }));
  };

  // Format sentiment trend data
  const formatSentimentData = () => {
    if (
      !analytics?.monthlyTrendData ||
      analytics.monthlyTrendData.length === 0
    ) {
      // Return sample data if no data is available
      return [
        { name: "Week 1", positive: 0, negative: 0, neutral: 0 },
        { name: "Week 2", positive: 0, negative: 0, neutral: 0 },
      ];
    }

    return analytics.monthlyTrendData.map((item) => ({
      name: formatMonth(item.month),
      positive: item.positive,
      negative: item.negative,
      neutral: item.neutral,
    }));
  };

  // This function is no longer needed as we're using direct data instead of percentage calculations
  const formatFeedbackCategoriesData = () => {
    if (!analytics) {
      return [{ name: "No Data", value: 0 }];
    }

    return [
      {
        name: "Positive",
        value: analytics.positiveFeedback,
        color: "#10b981",
      },
      {
        name: "Neutral",
        value: analytics.neutralFeedback,
        color: "#6b7280",
      },
      {
        name: "Negative",
        value: analytics.negativeFeedback,
        color: "#ef4444",
      },
    ];
  };

  // State for feedback pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;

  // Filter feedback based on filters
  const filteredFeedback = feedback.filter((item) => {
    // Search filter
    if (
      searchQuery &&
      !item.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Course filter (if we had course_id in feedback directly)
    if (courseFilter !== "all") {
      const event = events.find((e) => e.id === item.event_id);
      if (!event || event.course_id !== courseFilter) {
        return false;
      }
    }

    // Sentiment filter
    if (sentimentFilter !== "all" && item.tone !== sentimentFilter) {
      return false;
    }

    return true;
  });

  // Format course data
  const formatCourseData = () => {
    return courses.map((course) => {
      // Find events for this course
      const courseEvents = events.filter((e) => e.course_id === course.id);

      // Calculate totals
      const feedbackCount = courseEvents.reduce(
        (sum, e) => sum + (e.total_feedback_count || 0),
        0,
      );
      const positiveCount = courseEvents.reduce(
        (sum, e) => sum + (e.positive_feedback_count || 0),
        0,
      );
      const negativeCount = courseEvents.reduce(
        (sum, e) => sum + (e.negative_feedback_count || 0),
        0,
      );
      const neutralCount = courseEvents.reduce(
        (sum, e) => sum + (e.neutral_feedback_count || 0),
        0,
      );

      // Calculate averages
      const avgSentiment =
        feedbackCount > 0
          ? Math.round((positiveCount / feedbackCount) * 100)
          : 0;

      const responseRate =
        course.student_count && course.student_count > 0
          ? Math.round(
              (feedbackCount /
                (course.student_count * (courseEvents.length || 1))) *
                100,
            )
          : 0;

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        students: course.student_count || 0,
        feedbackCount,
        responseRate,
        avgSentiment,
        teacher: course.profiles?.full_name || "Unknown Teacher",
      };
    });
  };

  // Get event name by ID
  const getEventName = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return "Unknown Event";

    const date = new Date(event.event_date);
    return `${event.courses?.code || "Unknown"}: Event on ${date.toLocaleDateString()}`;
  };

  // Colors for pie charts
  const COLORS = ["#10b981", "#6b7280", "#ef4444", "#f59e0b", "#3b82f6"];

  // Stats Cards for Dashboard
  const statsCards = [
    {
      title: "Total Courses",
      value: analytics?.coursesCount.toString() || "0",
      icon: <Book className="h-4 w-4 text-emerald-600" />,
      change: "+5%",
      changeText: "from last month",
    },
    {
      title: "Total Feedback",
      value: analytics?.feedbackCount.toString() || "0",
      icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
      change: "+12%",
      changeText: "from last month",
    },
    {
      title: "Active Teachers",
      value: teachers.length.toString(),
      icon: <Users className="h-4 w-4 text-emerald-600" />,
      change: "+3",
      changeText: "new this month",
    },
    {
      title: "Sentiment Score",
      value: analytics?.positivePercentage
        ? `${Math.round(analytics.positivePercentage)}%`
        : "N/A",
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
      change: "+2.1%",
      changeText: "from last month",
    },
  ];

  // Loading State Component
  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mb-4" />
      <p className="text-lg text-muted-foreground">Loading analytics data...</p>
    </div>
  );

  // Error State Component
  const ErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-lg font-medium text-red-500">{message}</p>
      <Button
        variant="outline"
        className="mt-4"
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </div>
  );

  // Content for Overview tab
  const overviewTabContent = (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsCards.map((item) => (
              <Card key={item.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.title}
                  </CardTitle>
                  {item.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {item.change} {item.changeText}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Course Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>
                  Monthly responses and feedback submissions across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatCourseActivityData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="responses"
                        name="Total Responses"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="feedback"
                        name="Total Feedback"
                        fill="#60a5fa"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Trend</CardTitle>
                <CardDescription>
                  Feedback sentiment across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatSentimentData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="positive"
                        name="Positive"
                        stroke="#16a34a"
                        fill="#16a34a"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="neutral"
                        name="Neutral"
                        stroke="#737373"
                        fill="#737373"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="negative"
                        name="Negative"
                        stroke="#dc2626"
                        fill="#dc2626"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        stackId="1"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feedback Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Feedback Distribution</CardTitle>
              <CardDescription>
                Distribution of feedback by sentiment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Positive",
                        value: analytics?.positiveFeedback || 0,
                        fill: "#16a34a",
                      },
                      {
                        name: "Neutral",
                        value: analytics?.neutralFeedback || 0,
                        fill: "#737373",
                      },
                      {
                        name: "Negative",
                        value: analytics?.negativeFeedback || 0,
                        fill: "#dc2626",
                      },
                    ]}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value) => [value, "Count"]} />
                    <Legend />
                    <Bar dataKey="value" name="Feedback Count" barSize={30}>
                      {/* Use the colors specified in the data */}
                      {[
                        { fill: "#16a34a" },
                        { fill: "#737373" },
                        { fill: "#dc2626" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Courses Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Top Courses</CardTitle>
              <CardDescription>Courses with highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formatCourseData()
                  .sort((a, b) => b.feedbackCount - a.feedbackCount)
                  .slice(0, 5)
                  .map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <Book className="h-5 w-5 text-emerald-600" />
                        <div>
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {course.code} • {course.teacher}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-sm font-semibold">
                            {course.feedbackCount}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Feedback
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold">
                            {course.avgSentiment}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Positive
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  // Content for Courses tab
  const coursesTabContent = (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          {/* Course Performance Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {formatCourseData().map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="h-2 bg-emerald-500"></div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{course.name}</CardTitle>
                    <Badge variant="outline">{course.code}</Badge>
                  </div>
                  <CardDescription>
                    {course.students} enrolled students • Taught by{" "}
                    {course.teacher}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Feedback
                      </div>
                      <div className="text-lg font-semibold">
                        {course.feedbackCount}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Response Rate
                      </div>
                      <div className="text-lg font-semibold">
                        {course.responseRate}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Sentiment
                      </div>
                      <div className="text-lg font-semibold">
                        {course.avgSentiment}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Engagement
                      </div>
                      <div className="text-lg font-semibold">
                        {course.responseRate > 70
                          ? "High"
                          : course.responseRate > 50
                            ? "Medium"
                            : "Low"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/courses/${course.id}/analytics`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Activity Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Activity Times */}
            <Card>
              <CardHeader>
                <CardTitle>Student Activity Times</CardTitle>
                <CardDescription>
                  When students are most active across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        // Process feedback to calculate activity by time of day
                        const hourCounts = {
                          Morning: 0,
                          Afternoon: 0,
                          Evening: 0,
                          Night: 0,
                        };

                        feedback.forEach((item) => {
                          if (!item.created_at) return;

                          const date = new Date(item.created_at);
                          const hour = date.getHours();

                          if (hour >= 5 && hour < 12) hourCounts.Morning++;
                          else if (hour >= 12 && hour < 17)
                            hourCounts.Afternoon++;
                          else if (hour >= 17 && hour < 22)
                            hourCounts.Evening++;
                          else hourCounts.Night++;
                        });

                        return [
                          { time: "Morning (5-12)", count: hourCounts.Morning },
                          {
                            time: "Afternoon (12-17)",
                            count: hourCounts.Afternoon,
                          },
                          {
                            time: "Evening (17-22)",
                            count: hourCounts.Evening,
                          },
                          { time: "Night (22-5)", count: hourCounts.Night },
                        ];
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Student Activity"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Feedback by Day */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Day</CardTitle>
                <CardDescription>
                  Submission distribution by day of week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={(() => {
                        // Process feedback to calculate submissions by day of week
                        const weekdayCounts = {
                          Mon: 0,
                          Tue: 0,
                          Wed: 0,
                          Thu: 0,
                          Fri: 0,
                          Sat: 0,
                          Sun: 0,
                        };

                        feedback.forEach((item) => {
                          if (!item.created_at) return;

                          const date = new Date(item.created_at);
                          const weekdays = [
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                          ];
                          const weekday = weekdays[date.getDay()];

                          weekdayCounts[weekday]++;
                        });

                        // Convert to array for charting
                        return [
                          { day: "Mon", count: weekdayCounts.Mon },
                          { day: "Tue", count: weekdayCounts.Tue },
                          { day: "Wed", count: weekdayCounts.Wed },
                          { day: "Thu", count: weekdayCounts.Thu },
                          { day: "Fri", count: weekdayCounts.Fri },
                          { day: "Sat", count: weekdayCounts.Sat },
                          { day: "Sun", count: weekdayCounts.Sun },
                        ];
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        name="Submissions"
                        fill="#60a5fa"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  // Content for Feedback tab
  const feedbackTabContent = (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          {/* Feedback Distribution Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>
                  Overall sentiment across all feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Positive",
                          value: analytics?.positiveFeedback || 0,
                          fill: "#16a34a",
                        },
                        {
                          name: "Neutral",
                          value: analytics?.neutralFeedback || 0,
                          fill: "#737373",
                        },
                        {
                          name: "Negative",
                          value: analytics?.negativeFeedback || 0,
                          fill: "#dc2626",
                        },
                      ]}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip formatter={(value) => [value, "Count"]} />
                      <Legend />
                      <Bar dataKey="value" name="Feedback Count" barSize={30}>
                        {[
                          { fill: "#16a34a" },
                          { fill: "#737373" },
                          { fill: "#dc2626" },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Feedback by Course */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback by Course</CardTitle>
                <CardDescription>
                  Distribution of feedback across courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatCourseData()
                        .filter((c) => c.feedbackCount > 0)
                        .slice(0, 8)
                        .map((c, index) => ({
                          name: c.code,
                          value: c.feedbackCount,
                          fill: COLORS[index % COLORS.length],
                        }))}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={80} />
                      <Tooltip
                        formatter={(value) => [value, "Feedback Count"]}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Feedback" barSize={20}>
                        {formatCourseData()
                          .filter((c) => c.feedbackCount > 0)
                          .slice(0, 8)
                          .map((c, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Feedback with Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Feedback</CardTitle>
              <CardDescription>
                Latest feedback across all courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filter Bar */}
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={courseFilter} onValueChange={setCourseFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={sentimentFilter}
                    onValueChange={setSentimentFilter}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Feedback List */}
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No feedback matching your criteria
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFeedback.slice(0, 10).map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                item.tone === "positive"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : item.tone === "negative"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                              }
                            >
                              <span className="flex items-center gap-1">
                                {getSentimentIcon(item.tone)}
                                {item.tone.charAt(0).toUpperCase() +
                                  item.tone.slice(1)}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(item.created_at)}</span>
                          </div>
                        </div>

                        <p className="mb-3">{item.content}</p>

                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{getEventName(item.event_id)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );

  // Create tabs data for CustomTabs component
  const tabsData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </span>
      ),
      content: overviewTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Book className="h-4 w-4" />
          Courses
        </span>
      ),
      content: coursesTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </span>
      ),
      content: feedbackTabContent,
    },
  ];

  // Handle tab selection
  const handleTabChange = (index: number) => {
    setActiveTab(index);
    // Stay on the same page, just change the active tab
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Admin Analytics Dashboard
        </h1>
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2"
            onClick={syncFeedbackCounters}
            disabled={isSyncingCounters}
          >
            {isSyncingCounters ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Sync Counters
              </>
            )}
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Use CustomTabs component */}
      <CustomTabs
        tabs={tabsData}
        defaultActiveIndex={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Sync Results Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Counter Synchronization Results</DialogTitle>
            <DialogDescription>
              Comparison between actual feedback entries and counter values in
              events
            </DialogDescription>
          </DialogHeader>

          {syncResults && (
            <div className="space-y-4 my-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-md p-3 text-center">
                  <div className="text-xs text-muted-foreground">
                    Total Events
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {syncResults.totalEvents}
                  </div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-xs text-muted-foreground">
                    Total Feedback
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {syncResults.totalFeedback}
                  </div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-xs text-muted-foreground">
                    Events Needing Fix
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {syncResults.eventsNeedingFix}
                  </div>
                </div>
                <div className="border rounded-md p-3 text-center">
                  <div className="text-xs text-muted-foreground">
                    Events Fixed
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {syncResults.eventsFixed}
                  </div>
                </div>
              </div>

              {syncResults.eventsNeedingFix > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Details:</h3>
                  <div className="max-h-56 overflow-auto border rounded-md p-3">
                    {syncResults.details.map((item: any, index: number) => (
                      <div key={index} className="border-b last:border-0 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          {item.success ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          <span className="font-mono text-xs">{item.id}</span>
                          {!item.success && (
                            <span className="text-red-500 text-xs">
                              {item.error}
                            </span>
                          )}
                        </div>
                        {item.success && (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs pl-6">
                            <div className="text-muted-foreground">Before:</div>
                            <div>
                              Total: {item.before.total}, Positive:{" "}
                              {item.before.positive}, Negative:{" "}
                              {item.before.negative}, Neutral:{" "}
                              {item.before.neutral}
                            </div>
                            <div className="text-muted-foreground">After:</div>
                            <div>
                              Total: {item.after.total}, Positive:{" "}
                              {item.after.positive}, Negative:{" "}
                              {item.after.negative}, Neutral:{" "}
                              {item.after.neutral}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowSyncDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
