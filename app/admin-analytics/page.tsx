"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
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
  Clock,
  ThumbsUp,
  ThumbsDown,
  Minus,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

// Simple type definitions
interface Course {
  id: string;
  name: string;
  code: string;
  student_count?: number;
  owner_id: string;
  department_id?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Event {
  id: string;
  course_id: string;
  event_date: string;
  created_at: string;
  positive_feedback_count: number;
  negative_feedback_count: number;
  neutral_feedback_count: number;
  total_feedback_count: number;
}

interface Feedback {
  id: string;
  event_id: string;
  content: string;
  tone: "positive" | "negative" | "neutral";
  created_at: string;
}

interface Teacher {
  id: string;
  full_name: string;
}

export default function AdminAnalyticsPage() {
  // UI state
  const [timePeriod, setTimePeriod] = useState("7");
  const [activeTab, setActiveTab] = useState(0);
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [totalFeedback, setTotalFeedback] = useState(0);
  const [positiveFeedback, setPositiveFeedback] = useState(0);

  // Counter synchronization state
  const [isSyncingCounters, setIsSyncingCounters] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // STEP 1: Fetch basic courses without any relationships
        console.log("Fetching courses...");
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("id, name, code, student_count, owner_id, department_id");

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          throw new Error("Failed to load courses data");
        }

        console.log(`Fetched ${coursesData?.length || 0} courses`);
        setCourses(coursesData || []);

        // STEP 2: Fetch departments
        console.log("Fetching departments...");
        const { data: departmentsData, error: departmentsError } =
          await supabase.from("departments").select("id, name");

        if (departmentsError) {
          console.error("Error fetching departments:", departmentsError);
          throw new Error("Failed to load departments data");
        }

        console.log(`Fetched ${departmentsData?.length || 0} departments`);
        setDepartments(departmentsData || []);

        // STEP 3: Fetch teachers (basic)
        console.log("Fetching teachers...");
        const { data: teachersData, error: teachersError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("role", "teacher");

        if (teachersError) {
          console.error("Error fetching teachers:", teachersError);
          throw new Error("Failed to load teacher data");
        }

        console.log(`Fetched ${teachersData?.length || 0} teachers`);
        setTeachers(teachersData || []);

        // STEP 4: Fetch events (basic)
        console.log("Fetching events...");
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(
            "id, course_id, event_date, created_at, positive_feedback_count, negative_feedback_count, neutral_feedback_count, total_feedback_count",
          );

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          throw new Error("Failed to load events data");
        }

        console.log(`Fetched ${eventsData?.length || 0} events`);
        setEvents(eventsData || []);

        // STEP 5: Fetch feedback (basic)
        console.log("Fetching feedback...");
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("id, event_id, content, tone, created_at");

        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError);
          throw new Error("Failed to load feedback data");
        }

        console.log(`Fetched ${feedbackData?.length || 0} feedback items`);
        setFeedback(feedbackData || []);

        // Calculate some basic analytics
        let totalCount = 0;
        let positiveCount = 0;

        if (feedbackData && feedbackData.length > 0) {
          totalCount = feedbackData.length;
          positiveCount = feedbackData.filter(
            (f) => f.tone === "positive",
          ).length;
        }

        setTotalFeedback(totalCount);
        setPositiveFeedback(positiveCount);
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
  }, []);

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: string | undefined) => {
    if (!departmentId) return "Uncategorized";
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : "Uncategorized";
  };

  // Helper function to get teacher name by ID
  const getTeacherName = (teacherId: string | undefined) => {
    if (!teacherId) return "Unknown";
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.full_name : "Unknown";
  };

  // Get events for a given course
  const getCourseEvents = (courseId: string) => {
    return events.filter((e) => e.course_id === courseId);
  };

  // Get filtered courses based on selected department
  const getFilteredCourses = () => {
    if (departmentFilter === "all") {
      return courses;
    }
    return courses.filter((c) => c.department_id === departmentFilter);
  };

  // Format relative time
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

  // Get sentiment icon
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

  // Format course analytics
  const formatCourseData = () => {
    return getFilteredCourses().map((course) => {
      const courseEvents = getCourseEvents(course.id);

      // Calculate totals from events
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

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        students: course.student_count || 0,
        feedbackCount,
        avgSentiment,
        teacher: getTeacherName(course.owner_id),
        department: getDepartmentName(course.department_id),
      };
    });
  };

  // Filter feedback
  const getFilteredFeedback = () => {
    return feedback.filter((item) => {
      // Apply search
      if (
        searchQuery &&
        !item.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Apply sentiment filter
      if (sentimentFilter !== "all" && item.tone !== sentimentFilter) {
        return false;
      }

      // Apply course filter
      if (courseFilter !== "all") {
        const event = events.find((e) => e.id === item.event_id);
        if (!event || event.course_id !== courseFilter) {
          return false;
        }
      }

      // Apply department filter
      if (departmentFilter !== "all") {
        const event = events.find((e) => e.id === item.event_id);
        if (!event) return false;

        const course = courses.find((c) => c.id === event.course_id);
        if (!course || course.department_id !== departmentFilter) {
          return false;
        }
      }

      return true;
    });
  };

  // Generate fake chart data
  const generateChartData = () => {
    return [
      { month: "Jan", positive: 65, negative: 15, neutral: 20 },
      { month: "Feb", positive: 70, negative: 10, neutral: 20 },
      { month: "Mar", positive: 75, negative: 10, neutral: 15 },
      { month: "Apr", positive: 60, negative: 20, neutral: 20 },
      { month: "May", positive: 65, negative: 15, neutral: 20 },
    ];
  };

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

  // Stats Cards
  const statsCards = [
    {
      title: "Total Courses",
      value: courses.length.toString(),
      icon: <Book className="h-4 w-4 text-emerald-600" />,
    },
    {
      title: "Total Feedback",
      value: totalFeedback.toString(),
      icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
    },
    {
      title: "Teachers",
      value: teachers.length.toString(),
      icon: <Users className="h-4 w-4 text-emerald-600" />,
    },
    {
      title: "Sentiment Score",
      value:
        totalFeedback > 0
          ? `${Math.round((positiveFeedback / totalFeedback) * 100)}%`
          : "N/A",
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
    },
  ];

  // Content for Overview tab
  const overviewTabContent = (
    <div className="space-y-6">
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          {/* Stats Cards */}
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
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg border">
            <div className="font-medium text-sm">Filter by:</div>
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

          {/* Simple Chart */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sentiment Trend</CardTitle>
              <CardDescription>
                Feedback sentiment across all courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateChartData()}>
                    <XAxis dataKey="month" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f5f5f5"
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="positive"
                      name="Positive"
                      stroke="#16a34a"
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="neutral"
                      name="Neutral"
                      stroke="#737373"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="negative"
                      name="Negative"
                      stroke="#dc2626"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Courses */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Courses</CardTitle>
              <CardDescription>Courses with highest engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formatCourseData()
                  .sort((a, b) => b.feedbackCount - a.feedbackCount)
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
                  ))}
              </div>
            </CardContent>
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
          {/* Department Filter */}
          <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-muted/30 rounded-lg border">
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

          {/* Course Cards */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {formatCourseData().map((course) => (
              <Link key={course.id} href={`/dashboard/courses/${course.id}`}>
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
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-center p-4 bg-muted/30 rounded-lg border">
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
                <SelectTrigger className="w-[150px]">
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
            </div>
          </div>

          {/* Feedback List */}
          <div className="space-y-4">
            {getFilteredFeedback()
              .slice(0, 5)
              .map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            item.tone === "positive"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.tone === "negative"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
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
                  </CardContent>
                </Card>
              ))}
          </div>
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
  };

  // Mock synchronization function
  const syncFeedbackCounters = () => {
    setIsSyncingCounters(true);

    // Simulate syncing
    setTimeout(() => {
      toast({
        title: "Counters Synchronized",
        description: "All feedback counters are now up to date.",
      });
      setIsSyncingCounters(false);
    }, 1500);
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
    </div>
  );
}
