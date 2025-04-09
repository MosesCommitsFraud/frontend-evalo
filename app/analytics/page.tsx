"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Line,
  LineChart,
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
import { useAuth } from "@/contexts/AuthContext";

// Type definitions for our data
interface Course {
  id: string;
  name: string;
  code: string;
  student_count?: number;
  owner_id: string;
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
}

interface CourseAnalytics {
  id: string;
  name: string;
  code: string;
  students: number;
  feedbackCount: number;
  responseRate: number;
  avgSentiment: number;
}

interface CoursePageData {
  teacherCourses: CourseAnalytics[];
  studentActivityData: { time: string; count: number }[];
  submissionByDayData: { name: string; count: number }[];
  upcomingEvents: {
    id: string;
    courseId: string;
    title: string;
    date: string;
    time: string;
  }[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();

  // UI state
  const [timePeriod, setTimePeriod] = useState("30");
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherCourses, setTeacherCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  // Analytics state with proper type annotations
  const [overviewData, setOverviewData] = useState<
    Array<{
      name: string;
      value: string | number;
      icon: React.ReactNode;
      change: string;
      changeText: string;
    }>
  >([]);

  const [sentimentTrendData, setSentimentTrendData] = useState<
    Array<{
      name: string;
      positive: number;
      negative: number;
      neutral: number;
    }>
  >([]);

  interface CourseComparison {
    name: string;
    feedbackCount: number;
    responseRate: number;
    sentiment: number;
  }

  const [courseComparisonData, setCourseComparisonData] = useState<
    CourseComparison[]
  >([]);
  const [coursePageData, setCoursePageData] = useState<CoursePageData>({
    teacherCourses: [],
    studentActivityData: [],
    submissionByDayData: [],
    upcomingEvents: [],
  });

  // Format month for display
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Initialize empty data structures when no data is available
  const initializeEmptyData = () => {
    setOverviewData([
      {
        name: "Your Courses",
        value: 0,
        icon: <Book className="h-4 w-4 text-emerald-600" />,
        change: "",
        changeText: "active courses",
      },
      {
        name: "Course Feedback",
        value: 0,
        icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
        change: "",
        changeText: "total responses",
      },
      {
        name: "Active Students",
        value: 0,
        icon: <Users className="h-4 w-4 text-emerald-600" />,
        change: "",
        changeText: "enrolled students",
      },
      {
        name: "Response Rate",
        value: "0",
        icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
        change: "",
        changeText: "avg responses per course",
      },
    ]);

    setActivityData([
      { month: "Jan", responses: 0, feedback: 0 },
      { month: "Feb", responses: 0, feedback: 0 },
      { month: "Mar", responses: 0, feedback: 0 },
    ]);

    setSentimentData([
      { sentiment: "Positive", count: 0, percentage: 0 },
      { sentiment: "Neutral", count: 0, percentage: 0 },
      { sentiment: "Negative", count: 0, percentage: 0 },
    ]);

    setSentimentTrendData([
      { name: "Week 1", positive: 0, negative: 0, neutral: 0 },
      { name: "Week 2", positive: 0, negative: 0, neutral: 0 },
    ]);

    setCourseComparisonData([]);

    setCoursePageData({
      teacherCourses: [],
      studentActivityData: [],
      submissionByDayData: [],
      upcomingEvents: [],
    });
  };

  // Calculate teacher-specific analytics - wrap with useCallback to fix dependency issues
  const calculateTeacherAnalytics = useCallback(
    (courses: Course[], events: Event[], feedback: Feedback[]) => {
      // Calculate overall statistics
      const totalFeedback = feedback.length;
      let positiveFeedback = 0;
      let negativeFeedback = 0;
      let neutralFeedback = 0;

      feedback.forEach((item) => {
        if (item.tone === "positive") positiveFeedback++;
        else if (item.tone === "negative") negativeFeedback++;
        else if (item.tone === "neutral") neutralFeedback++;
      });

      // Calculate percentages
      const positivePercentage =
        totalFeedback > 0 ? (positiveFeedback / totalFeedback) * 100 : 0;
      const negativePercentage =
        totalFeedback > 0 ? (negativeFeedback / totalFeedback) * 100 : 0;
      const neutralPercentage =
        totalFeedback > 0 ? (neutralFeedback / totalFeedback) * 100 : 0;

      // Group feedback by month for trend data
      const monthlyCounts: Record<
        string,
        {
          month: string;
          positive: number;
          negative: number;
          neutral: number;
          total: number;
        }
      > = {};
      feedback.forEach((item) => {
        if (!item.created_at) return;

        const date = new Date(item.created_at);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!monthlyCounts[monthYear]) {
          monthlyCounts[monthYear] = {
            month: monthYear,
            positive: 0,
            negative: 0,
            neutral: 0,
            total: 0,
          };
        }

        monthlyCounts[monthYear].total++;

        if (item.tone === "positive") monthlyCounts[monthYear].positive++;
        else if (item.tone === "negative") monthlyCounts[monthYear].negative++;
        else if (item.tone === "neutral") monthlyCounts[monthYear].neutral++;
      });

      // Group feedback by day of week
      const weekdayCounts: Record<string, number> = {
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
        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weekday = weekdays[date.getDay()];

        weekdayCounts[weekday]++;
      });

      const weekdayData = Object.entries(weekdayCounts).map(
        ([name, count]) => ({
          name,
          count,
        }),
      );

      // Group feedback by time of day
      const hourCounts: Record<string, number> = {
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
        else if (hour >= 12 && hour < 17) hourCounts.Afternoon++;
        else if (hour >= 17 && hour < 22) hourCounts.Evening++;
        else hourCounts.Night++;
      });

      const timeOfDayData = Object.entries(hourCounts).map(([time, count]) => ({
        time,
        count,
      }));

      // Course comparison data
      const courseData = courses.map((course) => {
        const courseEvents = events.filter((e) => e.course_id === course.id);
        const courseFeedbackCount = courseEvents.reduce(
          (sum, event) => sum + (event.total_feedback_count || 0),
          0,
        );
        const coursePositiveFeedback = courseEvents.reduce(
          (sum, event) => sum + (event.positive_feedback_count || 0),
          0,
        );

        return {
          name: course.code,
          feedbackCount: courseFeedbackCount,
          responseRate: course.student_count
            ? Math.round((courseFeedbackCount / course.student_count) * 100)
            : 0,
          sentiment:
            courseFeedbackCount > 0
              ? Math.round((coursePositiveFeedback / courseFeedbackCount) * 100)
              : 0,
        };
      });

      // Set updated overview data
      setOverviewData([
        {
          name: "Your Courses",
          value: courses.length,
          icon: <Book className="h-4 w-4 text-emerald-600" />,
          change: "",
          changeText: "active courses",
        },
        {
          name: "Course Feedback",
          value: totalFeedback,
          icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
          change: "",
          changeText: "total responses",
        },
        {
          name: "Active Students",
          value: courses
            .reduce((total, course) => total + (course.student_count || 0), 0)
            .toString(),
          icon: <Users className="h-4 w-4 text-emerald-600" />,
          change: "",
          changeText: "enrolled students",
        },
        {
          name: "Response Rate",
          value:
            courses.length > 0
              ? Math.round(totalFeedback / courses.length) + "/course"
              : "0",
          icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
          change: "",
          changeText: "avg responses per course",
        },
      ]);

      // Update activity data
      setActivityData(
        Object.values(monthlyCounts)
          .sort((a, b) => a.month.localeCompare(b.month))
          .map((item) => ({
            month: formatMonth(item.month),
            responses: item.total,
            feedback: item.positive + item.negative + item.neutral,
          })),
      );

      // Update sentiment data for bar chart
      setSentimentData([
        {
          sentiment: "Positive",
          count: positiveFeedback,
          percentage: Math.round(positivePercentage),
        },
        {
          sentiment: "Neutral",
          count: neutralFeedback,
          percentage: Math.round(neutralPercentage),
        },
        {
          sentiment: "Negative",
          count: negativeFeedback,
          percentage: Math.round(negativePercentage),
        },
      ]);

      // Update sentiment trend data for line chart
      setSentimentTrendData(
        Object.values(monthlyCounts)
          .sort((a, b) => a.month.localeCompare(b.month))
          .map((item) => ({
            name: formatMonth(item.month),
            positive: item.positive,
            negative: item.negative,
            neutral: item.neutral,
          })),
      );

      // Update course comparison data
      setCourseComparisonData([...courseData]);

      // Update course page data
      setCoursePageData({
        teacherCourses: courses.map((course) => {
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
          const responseRate =
            course.student_count && course.student_count > 0
              ? Math.round((feedbackCount / course.student_count) * 100)
              : 0;
          const avgSentiment =
            feedbackCount > 0
              ? Math.round((positiveCount / feedbackCount) * 100)
              : 0;

          return {
            id: course.id,
            name: course.name,
            code: course.code,
            students: course.student_count || 0,
            feedbackCount,
            responseRate,
            avgSentiment,
          };
        }),
        studentActivityData: timeOfDayData,
        submissionByDayData: weekdayData,
        upcomingEvents: events
          .filter((e) => new Date(e.event_date) > new Date())
          .slice(0, 5)
          .map((e) => ({
            id: e.id,
            courseId: e.course_id,
            title: courses.find((c) => c.id === e.course_id)?.name || "Unknown",
            date: formatDate(e.event_date),
            time: new Date(e.event_date).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          })),
      });
    },
    [],
  );

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch only courses where the current user is the owner
        const { data: coursesData, error: coursesError } =
          await dataService.getCourses(user.id);

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          setError("Failed to load your courses");
          return;
        }

        // Set teacherCourses to the courses owned by this teacher
        const ownedCourses = coursesData || [];
        setTeacherCourses(ownedCourses);

        // If no courses are found, set empty data and return early
        if (ownedCourses.length === 0) {
          initializeEmptyData();
          setIsLoading(false);
          return;
        }

        // Get course IDs for further queries
        const courseIds = ownedCourses.map((course) => course.id);

        const supabase = createClient();

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
          calculateTeacherAnalytics(ownedCourses, [], []);
          setIsLoading(false);
          return;
        }

        // Get event IDs for feedback query
        const eventIds = eventsData.map((event) => event.id);

        // Fetch only feedback for the teacher's events
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("*")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false });

        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError);
          setError("Failed to load feedback for your courses");
          return;
        }

        setFeedback(feedbackData || []);

        // Calculate teacher-specific analytics
        calculateTeacherAnalytics(
          ownedCourses,
          eventsData || [],
          feedbackData || [],
        );
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An unexpected error occurred. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, timePeriod, calculateTeacherAnalytics]);

  // Set default active tab on component mount
  useEffect(() => {
    setActiveTab(0);
  }, []);

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

  // Filter feedback based on search and filters
  const filteredFeedback = feedback.filter((item) => {
    // Search filter
    if (
      searchQuery &&
      !item.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Course filter
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

  // Content for Overview tab
  const overviewTabContent = (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewData.map((item) => (
          <Card key={item.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
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
            <CardTitle>Course Comparison</CardTitle>
            <CardDescription>
              Overview of performance across all your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="feedbackCount"
                    name="Feedback Count"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="responseRate"
                    name="Response Rate (%)"
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
              Feedback sentiment trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sentimentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="positive"
                    name="Positive"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="neutral"
                    name="Neutral"
                    stroke="#737373"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="negative"
                    name="Negative"
                    stroke="#dc2626"
                    strokeWidth={2}
                    dot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Sentiment Distribution (Bar Chart instead of Pie Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback Distribution by Course</CardTitle>
          <CardDescription>
            Breakdown of feedback sentiment across your courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {teacherCourses.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={teacherCourses
                    .map((course) => {
                      const courseEvents = events.filter(
                        (e) => e.course_id === course.id,
                      );
                      const courseFeedback = feedback.filter((f) =>
                        courseEvents.some((e) => e.id === f.event_id),
                      );

                      const positive = courseFeedback.filter(
                        (f) => f.tone === "positive",
                      ).length;
                      const neutral = courseFeedback.filter(
                        (f) => f.tone === "neutral",
                      ).length;
                      const negative = courseFeedback.filter(
                        (f) => f.tone === "negative",
                      ).length;

                      return {
                        name: course.code,
                        positive,
                        neutral,
                        negative,
                        total: courseFeedback.length,
                      };
                    })
                    .filter((item) => item.total > 0)}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="positive"
                    name="Positive"
                    fill="#16a34a"
                    stackId="stack"
                  />
                  <Bar
                    dataKey="neutral"
                    name="Neutral"
                    fill="#737373"
                    stackId="stack"
                  />
                  <Bar
                    dataKey="negative"
                    name="Negative"
                    fill="#dc2626"
                    stackId="stack"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No feedback data available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Your Courses Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            Quick overview of your active courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teacherCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Book className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No courses found</h3>
              <p className="text-muted-foreground">
                You don&#39;t have any assigned courses yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {teacherCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <Book className="h-5 w-5 text-emerald-600" />
                    <div>
                      <div className="font-medium">{course.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {course.code}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/courses/${course.id}`}>
                      View Course
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Content for Courses tab
  const coursesTabContent = (
    <div className="space-y-6">
      {/* Course Performance Cards */}
      {coursePageData.teacherCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Book className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            You don&#39;t have any assigned courses yet
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {coursePageData.teacherCourses.map((course) => (
            <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
              <Card className="overflow-hidden hover:border-emerald-300 transition-colors cursor-pointer h-full">
                <div className="h-2 bg-emerald-500"></div>
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Book className="h-8 w-8 text-emerald-600 mb-2" />
                  <h3 className="font-medium mb-1">{course.name}</h3>
                  <Badge variant="outline">{course.code}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Engagement Trends by Course - More useful than the radar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends by Course</CardTitle>
          <CardDescription>
            Tracking student participation and feedback rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {courseComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={courseComparisonData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="feedbackCount"
                    name="Total Feedback"
                    fill="#10b981"
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No engagement data available yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Student Activity Times */}
        <Card>
          <CardHeader>
            <CardTitle>Student Activity Times</CardTitle>
            <CardDescription>
              When students are most active across your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePageData.studentActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    name="Submissions"
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
                <BarChart data={coursePageData.submissionByDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
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

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Course Events</CardTitle>
          <CardDescription>Important dates for your courses</CardDescription>
        </CardHeader>
        <CardContent>
          {coursePageData.upcomingEvents.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No upcoming events scheduled
            </div>
          ) : (
            <div className="space-y-4">
              {coursePageData.upcomingEvents.map((event) => {
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
    </div>
  );

  // Content for Feedback tab
  const feedbackTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>Student Feedback</CardTitle>
        <CardDescription>
          View and analyze feedback from all events in this course
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
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {teacherCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
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
        {feedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
            <p className="text-muted-foreground">
              You haven&#39;t received any feedback for your courses yet
            </p>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No feedback matching your search criteria
          </div>
        ) : (
          <>
            <div className="space-y-4 mt-4">
              {filteredFeedback
                .slice(currentPage * 5, currentPage * 5 + 5)
                .map((item) => {
                  // Find the event for this feedback
                  const event = events.find((e) => e.id === item.event_id);
                  // Find the course for this event
                  const course = event
                    ? teacherCourses.find((c) => c.id === event.course_id)
                    : null;

                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="bg-muted px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>
                              {event ? (
                                <>
                                  {course?.code} Event (
                                  {new Date(
                                    event.event_date,
                                  ).toLocaleDateString()}
                                  )
                                </>
                              ) : (
                                "Unknown event"
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="mb-2 flex items-center">
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

                        <p className="mb-3">{item.content}</p>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {Math.min(filteredFeedback.length, 5)} of{" "}
                {filteredFeedback.length} responses
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={(currentPage + 1) * 5 >= filteredFeedback.length}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
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
          Analytics Dashboard
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
