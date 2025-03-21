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
} from "lucide-react";
import { dataService } from "@/lib/data-service";
import { createClient } from "@/lib/supabase/client";

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

  // Calculate statistics for overview cards
  const calculateStats = () => {
    if (!analytics) return [];

    return [
      {
        name: "Total Courses",
        value: analytics.coursesCount.toString(),
        icon: <Book className="h-4 w-4 text-emerald-600" />,
        change: "+5%",
        changeText: "from last month",
      },
      {
        name: "Total Feedback",
        value: analytics.feedbackCount.toString(),
        icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
        change: "+12%",
        changeText: "from last month",
      },
      {
        name: "Active Teachers",
        value: teachers.length.toString(),
        icon: <Users className="h-4 w-4 text-emerald-600" />,
        change: "+3",
        changeText: "new this month",
      },
      {
        name: "Sentiment Score",
        value: analytics.positivePercentage
          ? `${Math.round(analytics.positivePercentage)}%`
          : "N/A",
        icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
        change: "+2.1%",
        changeText: "from last month",
      },
    ];
  };

  // Format course activity data
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

  // Format sentiment data
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

  // Format feedback categories data
  const formatFeedbackCategoriesData = () => {
    if (!analytics) {
      return [{ name: "No Data", value: 100 }];
    }

    const total = analytics.feedbackCount || 1; // Avoid division by zero

    return [
      {
        name: "Positive",
        value: Math.round((analytics.positiveFeedback / total) * 100),
      },
      {
        name: "Neutral",
        value: Math.round((analytics.neutralFeedback / total) * 100),
      },
      {
        name: "Negative",
        value: Math.round((analytics.negativeFeedback / total) * 100),
      },
    ];
  };

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

  // Format course aggregated data (for course cards)
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
                (course.student_count * courseEvents.length || 1)) *
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

  // Get event name by ID
  const getEventName = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return "Unknown Event";

    const date = new Date(event.event_date);
    return `${event.courses?.code || "Unknown"}: Event on ${date.toLocaleDateString()}`;
  };

  // Colors for pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

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

  // Generate the overview cards data
  const overviewData = isLoading ? [] : calculateStats();

  // Format data for charts
  const activityData = isLoading ? [] : formatCourseActivityData();
  const sentimentData = isLoading ? [] : formatSentimentData();
  const feedbackCategoriesData = isLoading
    ? []
    : formatFeedbackCategoriesData();
  const coursePageData = isLoading
    ? { teacherCourses: [] }
    : { teacherCourses: formatCourseData() };

  // Calculate student activity data (mock data for now, could be real with more DB fields)
  const studentActivityData = [
    { time: "Morning (6-12)", value: 32 },
    { time: "Afternoon (12-18)", value: 41 },
    { time: "Evening (18-24)", value: 52 },
    { time: "Night (0-6)", value: 18 },
  ];

  // Calculate submission by day data (mock data for now, could be real with more analysis)
  const submissionByDayData = [
    { day: "Monday", count: 45 },
    { day: "Tuesday", count: 63 },
    { day: "Wednesday", count: 58 },
    { day: "Thursday", count: 72 },
    { day: "Friday", count: 51 },
    { day: "Saturday", count: 33 },
    { day: "Sunday", count: 29 },
  ];

  // Mock upcoming events (in real application, could filter future events)
  const upcomingEvents = events
    .filter((e) => new Date(e.event_date) > new Date())
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      courseId: e.course_id,
      title: e.courses?.name || "Unknown Course",
      date: formatDate(e.event_date),
      time: new Date(e.event_date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

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
            {overviewData.map((item) => (
              <Card key={item.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.name}
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
                    <BarChart data={activityData}>
                      <XAxis dataKey="month" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Bar
                        dataKey="responses"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="feedback"
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
                    <LineChart data={sentimentData}>
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="positive"
                        stroke="#16a34a"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="negative"
                        stroke="#dc2626"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="neutral"
                        stroke="#737373"
                        strokeWidth={2}
                      />
                    </LineChart>
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
                  <PieChart>
                    <Pie
                      data={feedbackCategoriesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}%`}
                    >
                      {feedbackCategoriesData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
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
                {coursePageData.teacherCourses
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
            {coursePageData.teacherCourses.map((course) => (
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
                    <BarChart data={studentActivityData}>
                      <XAxis dataKey="time" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Bar
                        dataKey="value"
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
                    <BarChart data={submissionByDayData}>
                      <XAxis dataKey="day" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#60a5fa"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Course Events</CardTitle>
              <CardDescription>
                Important dates across all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No upcoming events scheduled
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => {
                    const course = coursePageData.teacherCourses.find(
                      (c) => c.id === event.courseId,
                    );

                    return (
                      <div
                        key={event.id}
                        className="flex items-center border-b pb-4 last:border-0 last:pb-0"
                      >
                        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                          <Calendar className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course?.code}: {course?.name}
                          </p>
                        </div>
                        <div className="ml-auto flex items-center">
                          <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">
                            {event.date} at {event.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
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
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Positive",
                            value: analytics?.positiveFeedback || 0,
                            color: "#16a34a",
                          },
                          {
                            name: "Neutral",
                            value: analytics?.neutralFeedback || 0,
                            color: "#737373",
                          },
                          {
                            name: "Negative",
                            value: analytics?.negativeFeedback || 0,
                            color: "#dc2626",
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {[
                          {
                            name: "Positive",
                            value: analytics?.positiveFeedback || 0,
                            color: "#16a34a",
                          },
                          {
                            name: "Neutral",
                            value: analytics?.neutralFeedback || 0,
                            color: "#737373",
                          },
                          {
                            name: "Negative",
                            value: analytics?.negativeFeedback || 0,
                            color: "#dc2626",
                          },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
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
                    <PieChart>
                      <Pie
                        data={coursePageData.teacherCourses
                          .filter((c) => c.feedbackCount > 0)
                          .map((c, index) => ({
                            name: c.code,
                            value: c.feedbackCount,
                            color: COLORS[index % COLORS.length],
                          }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {coursePageData.teacherCourses
                          .filter((c) => c.feedbackCount > 0)
                          .map((c, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
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
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback..."
                    className="pl-8"
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
                            <span>
                              {new Date(item.created_at).toLocaleString()}
                            </span>
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
        <div className="flex gap-2">
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
    </div>
  );
}
