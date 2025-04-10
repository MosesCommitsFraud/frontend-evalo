"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
  Line,
  LineChart,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  Search,
  Filter,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertTriangle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  ChevronDown,
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
  department_id: string; // Added department_id field
  profiles?: {
    full_name: string;
  };
  departments?: {
    // Added departments relationship
    id: string;
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
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
    department_id?: string;
    departments?: {
      name: string;
    };
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
    courses?: {
      department_id?: string;
    };
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
  department_id?: string;
}

interface DepartmentData {
  id: string;
  name: string;
  courseIds: string[];
  students: number;
  teachers: number;
  courses: number;
}

interface SyncResultDetail {
  id: string;
  success: boolean;
  error?: string;
  before?: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
  after?: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
}

interface SyncResults {
  totalEvents: number;
  totalFeedback: number;
  eventsNeedingFix: number;
  eventsFixed: number;
  details: SyncResultDetail[];
}

export default function AdminAnalyticsPage() {
  // UI state
  const [timePeriod, setTimePeriod] = useState("7");
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = 12;

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Department specific state
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);

  // Counter synchronization state
  const [isSyncingCounters, setIsSyncingCounters] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Create Supabase client
        const supabase = createClient();

        // Fetch global analytics
        const analyticsData = await dataService.getGlobalAnalytics();
        setAnalytics(analyticsData);

        // Fetch all departments first
        const { data: departmentsData, error: departmentsError } =
          await supabase.from("departments").select("*").order("name");

        if (departmentsError) {
          console.error("Error fetching departments:", departmentsError);
          throw new Error("Failed to load departments data");
        }
        setDepartments(departmentsData || []);

        // Fetch all courses with department data
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("*, profiles(full_name), departments(id, name)")
          .order("name");

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

        const teachersList =
          teachersData?.filter((t) => t.role === "teacher") || [];
        setTeachers(teachersList);

        // Calculate department data
        const deptData = departmentsData.map((dept) => {
          // Find courses in this department
          const coursesInDept =
            coursesData?.filter((c) => c.department_id === dept.id) || [];

          // Find teachers in this department
          const teachersInDept = teachersList.filter(
            (t) => t.department_id === dept.id,
          );

          const courseIds = coursesInDept.map((c) => c.id);
          let totalStudents = 0;

          coursesInDept.forEach((course) => {
            totalStudents += course.student_count || 0;
          });

          return {
            id: dept.id,
            name: dept.name,
            teachers: teachersInDept.length,
            courses: coursesInDept.length,
            students: totalStudents,
            courseIds,
          };
        });

        setDepartmentData(deptData);

        // Fetch all events with course and department data
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*, courses(name, code, department_id, departments(name))")
          .order("created_at", { ascending: false });

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          throw new Error("Failed to load event data");
        }
        setEvents(eventsData || []);

        // Apply time period filter to events
        const periodDate = new Date();
        periodDate.setDate(periodDate.getDate() - parseInt(timePeriod));

        const timeFilteredEvents = (eventsData || []).filter((event) => {
          const eventDate = new Date(event.created_at);
          return eventDate >= periodDate;
        });

        setFilteredEvents(timeFilteredEvents);

        // Fetch all feedback with event and course data
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("*, events!inner(course_id, courses(department_id))")
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

  // Update filtered events when time period changes
  useEffect(() => {
    if (events.length > 0) {
      const periodDate = new Date();
      periodDate.setDate(periodDate.getDate() - parseInt(timePeriod));

      const timeFilteredEvents = events.filter((event) => {
        const eventDate = new Date(event.created_at);
        return eventDate >= periodDate;
      });

      setFilteredEvents(timeFilteredEvents);
    }
  }, [timePeriod, events]);

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

  // Filter courses based on filter criteria
  const getFilteredCourses = () => {
    return courses.filter((course) => {
      // Department filter
      if (
        departmentFilter !== "all" &&
        course.department_id !== departmentFilter
      ) {
        return false;
      }

      // Event count filter
      if (eventFilter !== "all") {
        // Count events for this course within the selected time period
        const courseEvents = filteredEvents.filter(
          (e) => e.course_id === course.id,
        );
        const eventCount = courseEvents.length;

        if (eventFilter === "high" && eventCount < 5) return false;
        if (eventFilter === "medium" && (eventCount < 2 || eventCount >= 5))
          return false;
        if (eventFilter === "low" && eventCount >= 2) return false;
      }

      return true;
    });
  };

  // Format course data
  const formatCourseData = () => {
    return getFilteredCourses().map((course) => {
      // Find events for this course (using pre-filtered events)
      const courseEvents = filteredEvents.filter(
        (e) => e.course_id === course.id,
      );

      // Calculate totals
      const feedbackCount = courseEvents.reduce(
        (sum, e) => sum + (e.total_feedback_count || 0),
        0,
      );
      const positiveCount = courseEvents.reduce(
        (sum, e) => sum + (e.positive_feedback_count || 0),
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

      // Get department
      const department = course.departments?.name || "Uncategorized";

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        students: course.student_count || 0,
        feedbackCount,
        responseRate,
        avgSentiment,
        teacher: course.profiles?.full_name || "Unknown Teacher",
        department,
        departmentId: course.department_id,
        eventCount: courseEvents.length,
      };
    });
  };

  // Filter feedback based on filters
  const getFilteredFeedback = () => {
    // Apply time period filter to feedback
    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(timePeriod));

    return feedback.filter((item) => {
      // Time period filter
      const feedbackDate = new Date(item.created_at);
      if (feedbackDate < periodDate) {
        return false;
      }

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

      // Department filter
      if (departmentFilter !== "all") {
        const event = events.find((e) => e.id === item.event_id);
        if (!event || event.courses?.department_id !== departmentFilter) {
          return false;
        }
      }

      // Sentiment filter
      if (sentimentFilter !== "all" && item.tone !== sentimentFilter) {
        return false;
      }

      return true;
    });
  };

  // Get event name by ID
  const getEventName = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return "Unknown Event";

    const date = new Date(event.event_date);
    return `${event.courses?.code || "Unknown"}: Event on ${date.toLocaleDateString()}`;
  };

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

          {/* Charts Filter Controls */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg border">
            <div className="font-medium text-sm">Filter by:</div>

            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue placeholder="Event Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="high">High (5+)</SelectItem>
                <SelectItem value="medium">Medium (2-4)</SelectItem>
                <SelectItem value="low">Low (0-1)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[150px] h-8">
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
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Activity Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Course Activity - Improved sleeker design */}
            <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden rounded-lg border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Platform Activity</CardTitle>
                <CardDescription>
                  Monthly responses and feedback across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={formatCourseActivityData()}>
                      <defs>
                        <linearGradient
                          id="colorResponses"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                        <linearGradient
                          id="colorFeedback"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#60a5fa"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#60a5fa"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f5f5f5"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend iconType="circle" />
                      <Area
                        type="monotone"
                        dataKey="responses"
                        name="Total Responses"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorResponses)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="feedback"
                        name="Total Feedback"
                        stroke="#60a5fa"
                        fillOpacity={1}
                        fill="url(#colorFeedback)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis - Improved sleeker design */}
            <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden rounded-lg border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sentiment Trend</CardTitle>
                <CardDescription>
                  Feedback sentiment across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formatSentimentData()}>
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f5f5f5"
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend iconType="circle" />
                      <Line
                        type="monotone"
                        dataKey="positive"
                        name="Positive"
                        stroke="#16a34a"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#16a34a" }}
                        activeDot={{ r: 7, stroke: "#16a34a", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="neutral"
                        name="Neutral"
                        stroke="#737373"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#737373" }}
                        activeDot={{ r: 6, stroke: "#737373", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="negative"
                        name="Negative"
                        stroke="#dc2626"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#dc2626" }}
                        activeDot={{ r: 6, stroke: "#dc2626", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Courses Summary with Show More button */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Courses</CardTitle>
              <CardDescription>Courses with highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  // Get formatted course data and sort by feedback count
                  const sortedCourses = formatCourseData().sort(
                    (a, b) => b.feedbackCount - a.feedbackCount,
                  );

                  // Display top courses or show "no data" message
                  if (sortedCourses.length === 0) {
                    return (
                      <div className="text-center py-6 text-muted-foreground">
                        No courses match your filter criteria
                      </div>
                    );
                  }

                  // Display courses
                  return sortedCourses
                    .slice(0, showAllCourses ? undefined : 5)
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
                              <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                                {course.department}
                              </span>
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
                    ));
                })()}
              </div>
            </CardContent>
            {formatCourseData().length > 5 && (
              <CardFooter className="pt-2 pb-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAllCourses(!showAllCourses)}
                  className="w-full max-w-xs text-sm"
                >
                  {showAllCourses ? "Show Less" : "Show All Courses"}
                  <ChevronDown
                    className={`h-4 w-4 ml-1 ${
                      showAllCourses ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CardFooter>
            )}
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
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-muted/30 rounded-lg border">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-9"
                value={courseSearchQuery}
                onChange={(e) => setCourseSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Course Cards - Simplified like in normal analytics */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {(() => {
              // Filter and paginate courses
              const filteredCourses = formatCourseData().filter((course) => {
                // Apply search filter
                if (
                  courseSearchQuery &&
                  !course.name
                    .toLowerCase()
                    .includes(courseSearchQuery.toLowerCase()) &&
                  !course.code
                    .toLowerCase()
                    .includes(courseSearchQuery.toLowerCase())
                ) {
                  return false;
                }

                // Apply department filter
                if (
                  departmentFilter !== "all" &&
                  course.departmentId !== departmentFilter
                ) {
                  return false;
                }

                return true;
              });

              // State for pagination
              const pageCount = Math.ceil(
                filteredCourses.length / coursesPerPage,
              );

              // Get current page slice
              const currentCourses = filteredCourses.slice(
                currentPage * coursesPerPage,
                (currentPage + 1) * coursesPerPage,
              );

              return (
                <>
                  {currentCourses.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <Book className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No courses found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </p>
                    </div>
                  ) : (
                    <>
                      {currentCourses.map((course) => (
                        <Link
                          key={course.id}
                          href={`/dashboard/courses/${course.id}`}
                        >
                          <Card className="overflow-hidden hover:border-emerald-300 transition-colors cursor-pointer h-full shadow-sm hover:shadow-md">
                            <div className="h-2 bg-emerald-500"></div>
                            <CardContent className="p-4">
                              <div className="flex flex-col items-center justify-center text-center mb-2">
                                <h3 className="font-medium">{course.name}</h3>
                                <Badge variant="outline" className="mt-1">
                                  {course.code}
                                </Badge>
                              </div>
                              <div className="text-sm text-center text-muted-foreground">
                                {course.department}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}

                      {/* Pagination Controls */}
                      {pageCount > 1 && (
                        <div className="col-span-full flex justify-center mt-6">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(0)}
                              disabled={currentPage === 0}
                            >
                              First
                            </Button>
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
                            <div className="flex items-center px-3 text-sm text-muted-foreground">
                              Page {currentPage + 1} of {pageCount}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(pageCount - 1, prev + 1),
                                )
                              }
                              disabled={currentPage === pageCount - 1}
                            >
                              Next
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(pageCount - 1)}
                              disabled={currentPage === pageCount - 1}
                            >
                              Last
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );

  // Add Departments tab content
  const departmentsTabContent = (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No departments found</h3>
              <p className="text-muted-foreground">
                There are no departments set up in the system yet.
              </p>
            </div>
          ) : (
            <>
              {/* Department Selection */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Department Comparison
                  </CardTitle>
                  <CardDescription>
                    Compare sentiment and engagement metrics across departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentData.map((dept) => {
                          // Calculate department metrics
                          const deptCourses = courses.filter((c) =>
                            dept.courseIds.includes(c.id),
                          );

                          // Get feedback metrics
                          let positive = 0,
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            negative = 0,
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            neutral = 0,
                            total = 0;

                          deptCourses.forEach((course) => {
                            const courseEvents = filteredEvents.filter(
                              (e) => e.course_id === course.id,
                            );

                            courseEvents.forEach((event) => {
                              positive += event.positive_feedback_count || 0;
                              negative += event.negative_feedback_count || 0;
                              neutral += event.neutral_feedback_count || 0;
                              total += event.total_feedback_count || 0;
                            });
                          });

                          // Calculate percentages
                          const sentimentScore =
                            total > 0
                              ? Math.round((positive / total) * 100)
                              : 0;
                          const responseRate =
                            dept.students > 0
                              ? Math.round((total / dept.students) * 100)
                              : 0;

                          return {
                            name: dept.name,
                            sentimentScore,
                            responseRate,
                            feedbackCount: total,
                            teacherCount: dept.teachers,
                            studentCount: dept.students,
                            courseCount: dept.courses,
                          };
                        })}
                        layout="vertical"
                        margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis type="category" dataKey="name" width={80} />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "sentimentScore")
                              return [`${value}%`, "Positive Sentiment"];
                            if (name === "responseRate")
                              return [`${value}%`, "Response Rate"];
                            return [value, name];
                          }}
                          labelFormatter={(value) => `Department: ${value}`}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend iconType="circle" />
                        <Bar
                          dataKey="sentimentScore"
                          name="Sentiment Score"
                          fill="#16a34a"
                          radius={[0, 4, 4, 0]}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`rgba(22, 163, 74, ${0.5 + index * 0.1})`}
                            />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="responseRate"
                          name="Response Rate"
                          fill="#3b82f6"
                          radius={[0, 4, 4, 0]}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={`rgba(59, 130, 246, ${0.5 + index * 0.1})`}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Department Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departmentData.map((dept) => {
                  // Calculate department metrics
                  const deptCourses = courses.filter((c) =>
                    dept.courseIds.includes(c.id),
                  );

                  // Get feedback metrics
                  let positive = 0;
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  let negative = 0;
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  let neutral = 0;
                  let total = 0;

                  deptCourses.forEach((course) => {
                    const courseEvents = filteredEvents.filter(
                      (e) => e.course_id === course.id,
                    );

                    courseEvents.forEach((event) => {
                      positive += event.positive_feedback_count || 0;
                      negative += event.negative_feedback_count || 0;
                      neutral += event.neutral_feedback_count || 0;
                      total += event.total_feedback_count || 0;
                    });
                  });

                  // Calculate percentages
                  const sentimentScore =
                    total > 0 ? Math.round((positive / total) * 100) : 0;
                  const responseRate =
                    dept.students > 0
                      ? Math.round((total / dept.students) * 100)
                      : 0;

                  return (
                    <Card
                      key={dept.id}
                      className="overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="h-2 bg-blue-500"></div>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{dept.name}</CardTitle>
                          <Badge
                            className={
                              sentimentScore > 70
                                ? "bg-emerald-100 text-emerald-800"
                                : sentimentScore > 40
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {sentimentScore}% Positive
                          </Badge>
                        </div>
                        <CardDescription>
                          {dept.courses} courses • {dept.teachers} teachers •{" "}
                          {dept.students} students
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Feedback
                            </div>
                            <div className="text-lg font-semibold">{total}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Response Rate
                            </div>
                            <div className="text-lg font-semibold">
                              {responseRate}%
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Avg Feedback per Course
                            </div>
                            <div className="text-lg font-semibold">
                              {dept.courses > 0
                                ? Math.round(total / dept.courses)
                                : 0}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm text-muted-foreground">
                              Avg Students per Course
                            </div>
                            <div className="text-lg font-semibold">
                              {dept.courses > 0
                                ? Math.round(dept.students / dept.courses)
                                : 0}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Department Sentiment Benchmarking */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    Department Sentiment Benchmarking
                  </CardTitle>
                  <CardDescription>
                    Comparing sentiment scores across departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={departmentData.map((dept) => {
                          // Calculate department metrics for each sentiment category
                          const deptCourses = courses.filter((c) =>
                            dept.courseIds.includes(c.id),
                          );

                          // Get feedback metrics
                          let positive = 0,
                            negative = 0,
                            neutral = 0,
                            total = 0;

                          deptCourses.forEach((course) => {
                            const courseEvents = filteredEvents.filter(
                              (e) => e.course_id === course.id,
                            );

                            courseEvents.forEach((event) => {
                              positive += event.positive_feedback_count || 0;
                              negative += event.negative_feedback_count || 0;
                              neutral += event.neutral_feedback_count || 0;
                              total += event.total_feedback_count || 0;
                            });
                          });

                          // Calculate percentages
                          const positivePercent =
                            total > 0
                              ? Math.round((positive / total) * 100)
                              : 0;
                          const negativePercent =
                            total > 0
                              ? Math.round((negative / total) * 100)
                              : 0;
                          const neutralPercent =
                            total > 0 ? Math.round((neutral / total) * 100) : 0;

                          return {
                            name: dept.name,
                            positive: positivePercent,
                            negative: negativePercent,
                            neutral: neutralPercent,
                            benchmark: 70, // Set a benchmark line at 70% positive
                          };
                        })}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                        <XAxis dataKey="name" />
                        <YAxis
                          domain={[0, 100]}
                          label={{
                            value: "Percentage",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          formatter={(value) => [`${value}%`, ""]}
                          contentStyle={{
                            borderRadius: "8px",
                            border: "none",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend iconType="circle" />
                        <Bar
                          dataKey="positive"
                          name="Positive"
                          fill="#16a34a"
                          radius={[4, 4, 0, 0]}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell
                              key={`positive-${index}`}
                              fill={`rgba(22, 163, 74, ${0.7 + index * 0.05})`}
                            />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="neutral"
                          name="Neutral"
                          fill="#737373"
                          radius={[4, 4, 0, 0]}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell
                              key={`neutral-${index}`}
                              fill={`rgba(115, 115, 115, ${0.7 + index * 0.05})`}
                            />
                          ))}
                        </Bar>
                        <Bar
                          dataKey="negative"
                          name="Negative"
                          fill="#dc2626"
                          radius={[4, 4, 0, 0]}
                        >
                          {departmentData.map((entry, index) => (
                            <Cell
                              key={`negative-${index}`}
                              fill={`rgba(220, 38, 38, ${0.7 + index * 0.05})`}
                            />
                          ))}
                        </Bar>
                        <Line
                          type="monotone"
                          dataKey="benchmark"
                          name="Benchmark (70%)"
                          stroke="#ff8c00"
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={false}
                          activeDot={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
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
          {/* Recent Feedback with Filters */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Feedback</CardTitle>
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
                    value={departmentFilter}
                    onValueChange={setDepartmentFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
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
              {(() => {
                const filteredFeedbackList = getFilteredFeedback();

                return filteredFeedbackList.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No feedback matching your criteria
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredFeedbackList.slice(0, 5).map((item) => (
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
                );
              })()}
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
          <Users className="h-4 w-4" />
          Departments
        </span>
      ),
      content: departmentsTabContent,
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
                    {syncResults.details.map(
                      (item: SyncResultDetail, index: number) => (
                        <div
                          key={index}
                          className="border-b last:border-0 py-2"
                        >
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
                              <div className="text-muted-foreground">
                                Before:
                              </div>
                              <div>
                                Total: {item.before?.total ?? 0}, Positive:{" "}
                                {item.before?.positive ?? 0}, Negative:{" "}
                                {item.before?.negative ?? 0}, Neutral:{" "}
                                {item.before?.neutral ?? 0}
                              </div>
                              <div className="text-muted-foreground">
                                After:
                              </div>
                              <div>
                                Total: {item.after?.total ?? 0}, Positive:{" "}
                                {item.after?.positive ?? 0}, Negative:{" "}
                                {item.after?.negative ?? 0}, Neutral:{" "}
                                {item.after?.neutral ?? 0}
                              </div>
                            </div>
                          )}
                        </div>
                      ),
                    )}
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
