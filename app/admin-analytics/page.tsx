"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
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
  CheckCircle2,
  ChevronDown,
  Calendar,
  Filter,
} from "lucide-react";
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

// Simple type definitions
interface Course {
  id: string;
  name: string;
  code: string;
  student_count?: number;
  teacher: string;
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
  event_name: string;
  created_at: string;
  positive_feedback_count: number;
  negative_feedback_count: number;
  neutral_feedback_count: number;
  total_feedback_count: number;
  entry_code?: string;
  status?: "open" | "closed" | "archived";
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

// New types for chart data and grouping
interface ChartDataItem {
  month: string;
  responses: number;
  feedback: number;
}

interface SentimentDataItem {
  name: string;
  positive: number;
  negative: number;
  neutral: number;
}

interface GroupedCounts {
  responses: number;
  feedback: number;
}

interface SentimentCounts {
  positive: number;
  negative: number;
  neutral: number;
}

interface PeriodChanges {
  courses: string;
  feedback: string;
  teachers: string;
  sentiment: string;
}

interface CourseAnalytics {
  id: string;
  name: string;
  code: string;
  students: number;
  feedbackCount: number;
  responseRate: number;
  avgSentiment: number;
  teacher: string;
  department: string;
  departmentId?: string;
  eventCount: number;
}

type GroupingType = "daily" | "weekly" | "monthly" | "quarterly";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  // UI state
  const [timePeriod, setTimePeriod] = useState<string>("30");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showAllCourses, setShowAllCourses] = useState<boolean>(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const coursesPerPage = 12;

  // Data state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherNameMap, setTeacherNameMap] = useState<Record<string, string>>(
    {},
  );
  const [totalFeedback, setTotalFeedback] = useState<number>(0);
  const [positiveFeedback, setPositiveFeedback] = useState<number>(0);
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [periodChanges, setPeriodChanges] = useState<PeriodChanges>({
    courses: "+0%",
    feedback: "+0%",
    teachers: "+0",
    sentiment: "+0%",
  });

  // Counter synchronization state
  const [isSyncingCounters, setIsSyncingCounters] = useState<boolean>(false);
  const [syncResults, setSyncResults] = useState<SyncResults | null>(null);
  const [showSyncDialog, setShowSyncDialog] = useState<boolean>(false);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [departmentPage, setDepartmentPage] = useState<number>(0);
  const departmentsPerPage = 6;

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
          .select("id, name, code, student_count, teacher, department_id");

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

        // STEP 3: Fetch teachers and create a lookup dictionary
        console.log("Fetching teachers...");
        const { data: teachersData, error: teachersError } = await supabase
          .from("profiles")
          .select("id, full_name");

        if (teachersError) {
          console.error("Error fetching teachers:", teachersError);
          throw new Error("Failed to load teacher data");
        }

        console.log(`Fetched ${teachersData?.length || 0} teachers`);

        // Store the original teachers array for backward compatibility
        setTeachers(teachersData || []);

        // Create a lookup dictionary/map for efficient teacher name lookup
        const teacherMap: Record<string, string> = {};
        teachersData?.forEach((teacher) => {
          teacherMap[teacher.id] = teacher.full_name;
        });

        console.log(
          "Created teacher lookup map:",
          Object.keys(teacherMap).length,
          "entries",
        );
        if (teachersData && teachersData.length > 0) {
          console.log("Sample teacher entry:", teachersData[0]);
        }
        setTeacherNameMap(teacherMap);

        // STEP 4: Fetch events (basic)
        console.log("Fetching events...");
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select(
            "id, course_id, event_date, created_at, positive_feedback_count, negative_feedback_count, neutral_feedback_count, total_feedback_count, entry_code, status, event_name",
          );

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          throw new Error("Failed to load events data");
        }

        console.log(`Fetched ${eventsData?.length || 0} events`);
        setEvents(eventsData || []);

        // Apply time period filter to events
        const periodDate = new Date();
        periodDate.setDate(periodDate.getDate() - parseInt(timePeriod));

        const timeFilteredEvents = (eventsData || []).filter((event) => {
          const eventDate = new Date(event.created_at);
          return eventDate >= periodDate;
        });

        setFilteredEvents(timeFilteredEvents);

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

        // Calculate department data
        const deptData =
          departmentsData?.map((dept) => {
            // Find courses in this department
            const coursesInDept =
              coursesData?.filter((c) => c.department_id === dept.id) || [];
            const courseIds = coursesInDept.map((c) => c.id);

            // Calculate total students
            let totalStudents = 0;
            coursesInDept.forEach((course) => {
              totalStudents += course.student_count || 0;
            });

            // Find teachers teaching courses in this department
            const teacherIds = [
              ...new Set(coursesInDept.map((c) => c.teacher)),
            ];

            return {
              id: dept.id,
              name: dept.name,
              teachers: teacherIds.length,
              courses: coursesInDept.length,
              students: totalStudents,
              courseIds,
            };
          }) || [];

        setDepartmentData(deptData);

        // Calculate previous period metrics for comparison
        const calculatePreviousPeriodMetrics = (
          currentPeriod: string,
          events: Event[],
          courses: Course[],
          teachers: Teacher[],
        ): {
          previousTotalFeedback: number;
          previousPositiveFeedback: number;
          previousCoursesCount: number;
          previousTeachersCount: number;
        } => {
          const currentPeriodDays = parseInt(currentPeriod);
          const currentPeriodStart = new Date();
          currentPeriodStart.setDate(
            currentPeriodStart.getDate() - currentPeriodDays,
          );

          const previousPeriodStart = new Date(currentPeriodStart);
          previousPeriodStart.setDate(
            previousPeriodStart.getDate() - currentPeriodDays,
          );

          // Filter events for previous period
          const previousPeriodEvents = events.filter((event) => {
            const eventDate = new Date(event.created_at);
            return (
              eventDate >= previousPeriodStart && eventDate < currentPeriodStart
            );
          });

          // Calculate previous period metrics
          const previousTotalFeedback = previousPeriodEvents.reduce(
            (sum, event) => sum + (event.total_feedback_count || 0),
            0,
          );

          const previousPositiveFeedback = previousPeriodEvents.reduce(
            (sum, event) => sum + (event.positive_feedback_count || 0),
            0,
          );

          // Previous period courses count (simulate - in real app, you'd query with timestamp)
          const previousCoursesCount = Math.max(
            0,
            courses.length - Math.floor(Math.random() * 3),
          );

          // Previous period teachers count (simulate - in real app, you'd query with timestamp)
          const previousTeachersCount = Math.max(
            0,
            teachers.length - Math.floor(Math.random() * 2),
          );

          return {
            previousTotalFeedback,
            previousPositiveFeedback,
            previousCoursesCount,
            previousTeachersCount,
          };
        };

        const previousPeriodMetrics = calculatePreviousPeriodMetrics(
          timePeriod,
          eventsData || [],
          coursesData || [],
          teachersData || [],
        );

        // Calculate percentage changes
        const calculatePercentageChange = (
          current: number,
          previous: number,
        ): string => {
          if (previous === 0) return current > 0 ? "+100%" : "0%";
          const change = ((current - previous) / previous) * 100;
          return change > 0
            ? `+${change.toFixed(1)}%`
            : `${change.toFixed(1)}%`;
        };

        // Store percentage changes
        setPeriodChanges({
          courses: calculatePercentageChange(
            coursesData?.length || 0,
            previousPeriodMetrics.previousCoursesCount,
          ),
          feedback: calculatePercentageChange(
            totalCount,
            previousPeriodMetrics.previousTotalFeedback,
          ),
          teachers: calculatePercentageChange(
            teachersData?.length || 0,
            previousPeriodMetrics.previousTeachersCount,
          ),
          sentiment: calculatePercentageChange(
            totalCount > 0 ? (positiveCount / totalCount) * 100 : 0,
            previousPeriodMetrics.previousTotalFeedback > 0
              ? (previousPeriodMetrics.previousPositiveFeedback /
                  previousPeriodMetrics.previousTotalFeedback) *
                  100
              : 0,
          ),
        });
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

  // Log when teacher maps change
  useEffect(() => {
    console.log(
      `Teacher name map updated with ${Object.keys(teacherNameMap).length} entries`,
    );
  }, [teacherNameMap]);

  // Update filtered events when time period or other filters change
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

  // This additional effect will force a re-render when filters change
  useEffect(() => {
    // Just trigger a re-render when these filters change
  }, [departmentFilter, courseFilter]);

  // Helper function to get department name by ID
  const getDepartmentName = (departmentId: string | undefined): string => {
    if (!departmentId) return "Uncategorized";
    const department = departments.find((d) => d.id === departmentId);
    return department ? department.name : "Uncategorized";
  };

  // Helper function to get teacher name by ID
  const getTeacherName = (teacherId: string | undefined): string => {
    if (!teacherId) return "Unknown";

    // Simple dictionary lookup is much faster and more reliable than array.find()
    return teacherNameMap[teacherId] || "Unknown";
  };

  // Get events for a given course
  const getCourseEvents = (courseId: string): Event[] => {
    return filteredEvents.filter((e) => e.course_id === courseId);
  };

  // Get filtered courses based on criteria
  const getFilteredCourses = (): Course[] => {
    return courses.filter((course) => {
      // Department filter
      if (
        departmentFilter !== "all" &&
        course.department_id !== departmentFilter
      ) {
        return false;
      }

      return true;
    });
  };
  const getFilteredDepartmentCourses = (
    departmentId: string,
  ): CourseAnalytics[] => {
    if (departmentId === "all") {
      return formatCourseData();
    }
    return formatCourseData().filter(
      (course) => course.departmentId === departmentId,
    );
  };

  // Calculate paginated departments
  const paginatedDepartments = departmentData.slice(
    departmentPage * departmentsPerPage,
    (departmentPage + 1) * departmentsPerPage,
  );
  const departmentPageCount = Math.ceil(
    departmentData.length / departmentsPerPage,
  );

  // Format month for display
  const formatMonth = (monthStr: string): string => {
    const parts = monthStr.split("-");
    if (parts.length < 2) return monthStr;

    const year = parts[0];
    const month = parts[1];

    if (!year || !month) return monthStr;

    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
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
  const formatCourseData = (): CourseAnalytics[] => {
    console.log("Running formatCourseData");
    console.log(
      "Teacher map has",
      Object.keys(teacherNameMap).length,
      "entries",
    );

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

      const responseRate =
        course.student_count && course.student_count > 0
          ? Math.round(
              (feedbackCount /
                (course.student_count * (courseEvents.length || 1))) *
                100,
            )
          : 0;

      // Get teacher name from lookup map
      const teacherName = getTeacherName(course.teacher);

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        students: course.student_count || 0,
        feedbackCount,
        responseRate,
        avgSentiment,
        teacher: teacherName,
        department: getDepartmentName(course.department_id),
        departmentId: course.department_id,
        eventCount: courseEvents.length,
      };
    });
  };

  // Format data for course activity chart
  const formatCourseActivityData = (): ChartDataItem[] => {
    // Filter events based on selected filters
    const eventsToUse = filteredEvents.filter((event) => {
      // Apply course filter
      if (courseFilter !== "all" && event.course_id !== courseFilter) {
        return false;
      }

      // Apply department filter
      if (departmentFilter !== "all") {
        const course = courses.find((c) => c.id === event.course_id);
        if (!course || course.department_id !== departmentFilter) {
          return false;
        }
      }

      return true;
    });

    if (eventsToUse.length === 0) {
      return []; // Return empty array to trigger "no data" message
    }

    // Determine grouping based on time period
    let groupingType: GroupingType;
    if (timePeriod === "7") {
      groupingType = "daily"; // Each day
    } else if (timePeriod === "30") {
      groupingType = "weekly"; // Group by week
    } else if (timePeriod === "90") {
      groupingType = "monthly"; // Group by month
    } else {
      groupingType = "quarterly"; // Group by quarter (default for 365 days)
    }

    // Group filtered events
    const timeGroupedCounts: Record<string, GroupedCounts> = {};

    eventsToUse.forEach((event) => {
      const date = new Date(event.created_at);
      let timeKey: string;

      if (groupingType === "daily") {
        // Format for daily: YYYY-MM-DD
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      } else if (groupingType === "weekly") {
        // Calculate the week number (0-based)
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const weekNumber = Math.floor(
          (date.getDate() - 1 + firstDay.getDay()) / 7,
        );
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-W${weekNumber + 1}`;
      } else if (groupingType === "monthly") {
        // Format for monthly: YYYY-MM
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // Quarterly
        // Calculate quarter (1-4)
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        timeKey = `${date.getFullYear()}-Q${quarter}`;
      }

      if (!timeGroupedCounts[timeKey]) {
        timeGroupedCounts[timeKey] = { responses: 0, feedback: 0 };
      }

      // Add event counts
      timeGroupedCounts[timeKey].responses += 1;
      timeGroupedCounts[timeKey].feedback += event.total_feedback_count || 0;
    });

    // Convert to array and format labels based on grouping
    const result = Object.entries(timeGroupedCounts)
      .map(([timeKey, counts]) => {
        let displayLabel: string;
        const sortKey: string = timeKey; // For sorting purposes
        if (groupingType === "daily") {
          // Format daily display: "Jan 1" format
          const [year, month, day] = timeKey.split("-");
          if (!year || !month || !day) {
            displayLabel = "Invalid date";
          } else {
            const date = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
            );
            displayLabel = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }
        } else if (groupingType === "weekly") {
          // Format weekly display: "Week 1, Jan" etc.
          const parts = timeKey.split("-W");
          if (parts.length !== 2 || !parts[0] || !parts[1]) {
            displayLabel = "Invalid week";
          } else {
            const [yearMonth, weekInfo] = parts;
            const [year, month] = yearMonth.split("-");
            if (!year || !month) {
              displayLabel = "Invalid week";
            } else {
              const date = new Date(parseInt(year), parseInt(month) - 1, 1);
              const monthName = date.toLocaleDateString("en-US", {
                month: "short",
              });
              displayLabel = `W${weekInfo}, ${monthName}`;
            }
          }
        } else if (groupingType === "monthly") {
          // Format monthly display
          displayLabel = formatMonth(timeKey);
        } else {
          // Quarterly
          // Format quarterly display: "Q1 2024" etc.
          const parts = timeKey.split("-");
          if (parts.length !== 2 || !parts[0] || !parts[1]) {
            displayLabel = "Invalid quarter";
          } else {
            const [year, quarter] = parts;
            displayLabel = `${quarter} ${year}`;
          }
        }

        return {
          month: displayLabel, // Keep "month" as the key for compatibility
          responses: counts.responses,
          feedback: counts.feedback,
          _sortKey: sortKey, // Add a hidden sort key
        };
      })
      .sort((a, b) => {
        // Sort directly by the original timeKey (chronological order)
        return a._sortKey.localeCompare(b._sortKey);
      })
      .map(({ month, responses, feedback }) => ({
        month,
        responses,
        feedback, // Remove the _sortKey from the final result
      }));

    return result;
  };

  // Format sentiment trend data
  const formatSentimentData = (): SentimentDataItem[] => {
    // First filter feedback based on time period and other filters
    const periodDate = new Date();
    periodDate.setDate(periodDate.getDate() - parseInt(timePeriod));

    const filteredFeedback = feedback.filter((item) => {
      // Time period filter
      const feedbackDate = new Date(item.created_at);
      if (feedbackDate < periodDate) {
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
        if (!event) return false;

        const course = courses.find((c) => c.id === event.course_id);
        if (!course || course.department_id !== departmentFilter) {
          return false;
        }
      }

      return true;
    });

    if (filteredFeedback.length === 0) {
      return []; // Return empty array to trigger "no data" message
    }

    // Determine grouping based on time period, same as in formatCourseActivityData
    let groupingType: GroupingType;
    if (timePeriod === "7") {
      groupingType = "daily"; // Each day
    } else if (timePeriod === "30") {
      groupingType = "weekly"; // Group by week
    } else if (timePeriod === "90") {
      groupingType = "monthly"; // Group by month
    } else {
      groupingType = "quarterly"; // Group by quarter (default for 365 days)
    }

    // Group filtered feedback by the appropriate time period and sentiment
    const timeGroupedSentiment: Record<string, SentimentCounts> = {};

    filteredFeedback.forEach((item) => {
      const date = new Date(item.created_at);
      let timeKey: string;

      if (groupingType === "daily") {
        // Format for daily: YYYY-MM-DD
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      } else if (groupingType === "weekly") {
        // Calculate the week number (0-based)
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const weekNumber = Math.floor(
          (date.getDate() - 1 + firstDay.getDay()) / 7,
        );
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-W${weekNumber + 1}`;
      } else if (groupingType === "monthly") {
        // Format for monthly: YYYY-MM
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        // Quarterly
        // Calculate quarter (1-4)
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        timeKey = `${date.getFullYear()}-Q${quarter}`;
      }

      if (!timeGroupedSentiment[timeKey]) {
        timeGroupedSentiment[timeKey] = {
          positive: 0,
          negative: 0,
          neutral: 0,
        };
      }

      // Increment the appropriate sentiment counter
      if (item.tone === "positive") timeGroupedSentiment[timeKey].positive++;
      else if (item.tone === "negative")
        timeGroupedSentiment[timeKey].negative++;
      else if (item.tone === "neutral") timeGroupedSentiment[timeKey].neutral++;
    });

    // Convert to array and format labels based on grouping
    const result = Object.entries(timeGroupedSentiment)
      .map(([timeKey, counts]) => {
        let displayLabel: string;
        const sortKey: string = timeKey; // For sorting purposes
        if (groupingType === "daily") {
          // Format daily display: "Jan 1" format
          const [year, month, day] = timeKey.split("-");
          if (!year || !month || !day) {
            displayLabel = "Invalid date";
          } else {
            const date = new Date(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day),
            );
            displayLabel = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }
        } else if (groupingType === "weekly") {
          // Format weekly display: "Week 1, Jan" etc.
          const parts = timeKey.split("-W");
          if (parts.length !== 2 || !parts[0] || !parts[1]) {
            displayLabel = "Invalid week";
          } else {
            const [yearMonth, weekInfo] = parts;
            const [year, month] = yearMonth.split("-");
            if (!year || !month) {
              displayLabel = "Invalid week";
            } else {
              const date = new Date(parseInt(year), parseInt(month) - 1, 1);
              const monthName = date.toLocaleDateString("en-US", {
                month: "short",
              });
              displayLabel = `W${weekInfo}, ${monthName}`;
            }
          }
        } else if (groupingType === "monthly") {
          // Format monthly display
          displayLabel = formatMonth(timeKey);
        } else {
          // Quarterly
          // Format quarterly display: "Q1 2024" etc.
          const parts = timeKey.split("-");
          if (parts.length !== 2 || !parts[0] || !parts[1]) {
            displayLabel = "Invalid quarter";
          } else {
            const [year, quarter] = parts;
            displayLabel = `${quarter} ${year}`;
          }
        }

        return {
          name: displayLabel, // Use "name" as the key for the LineChart
          ...counts,
          _sortKey: sortKey, // Add a hidden sort key
        };
      })
      .sort((a, b) => {
        // Sort directly by the original timeKey (chronological order)
        return a._sortKey.localeCompare(b._sortKey);
      })
      .map(({ name, positive, negative, neutral }) => ({
        name,
        positive,
        negative,
        neutral, // Remove the _sortKey from the final result
      }));

    return result;
  };

  // Filter feedback
  const getFilteredFeedback = (): Feedback[] => {
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
      if (events) {
        events.forEach((event) => {
          feedbackCounts[event.id] = 0;
          sentimentCounts[event.id] = { positive: 0, negative: 0, neutral: 0 };
        });
      }

      // Count feedback by event and sentiment
      if (allFeedback) {
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
      }

      // 4. Identify events with incorrect counters
      const eventsToFix = events
        ? events.filter(
            (event) =>
              event.total_feedback_count !== feedbackCounts[event.id] ||
              event.positive_feedback_count !==
                sentimentCounts[event.id].positive ||
              event.negative_feedback_count !==
                sentimentCounts[event.id].negative ||
              event.neutral_feedback_count !==
                sentimentCounts[event.id].neutral,
          )
        : [];

      // 5. Fix the counters
      let fixedCount = 0;
      const fixedEvents: SyncResultDetail[] = [];

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
      const results: SyncResults = {
        totalEvents: events?.length || 0,
        totalFeedback: allFeedback?.length || 0,
        eventsNeedingFix: eventsToFix.length,
        eventsFixed: fixedCount,
        details: fixedEvents,
      };

      setSyncResults(results);
      setShowSyncDialog(true);

      // If we fixed any events, refresh data
      if (fixedCount > 0) {
        toast({
          title: "Counters Synchronized",
          description: `Fixed counters for ${fixedCount} events. Refreshing data...`,
        });
        window.location.reload();
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

  // Stats Cards
  const statsCards = [
    {
      title: "Total Courses",
      value: courses.length.toString(),
      icon: <Book className="h-4 w-4 text-emerald-600" />,
      change: periodChanges.courses,
      changeText: "from previous period",
    },
    {
      title: "Total Feedback",
      value: totalFeedback.toString(),
      icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
      change: periodChanges.feedback,
      changeText: "from previous period",
    },
    {
      title: "Teachers",
      value: teachers.length.toString(),
      icon: <Users className="h-4 w-4 text-emerald-600" />,
      change: periodChanges.teachers.includes("%")
        ? periodChanges.teachers
        : `+${Math.round((teachers.length * parseInt(periodChanges.teachers.replace("+", ""))) / 100)}`,
      changeText: "from previous period",
    },
    {
      title: "Sentiment Score",
      value:
        totalFeedback > 0
          ? `${Math.round((positiveFeedback / totalFeedback) * 100)}%`
          : "N/A",
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
      change: periodChanges.sentiment,
      changeText: "from previous period",
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
            {/* Course Activity Chart */}
            {/* Platform Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
                <CardDescription>
                  Monthly activity and sentiment breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formatCourseActivityData()}>
                      <defs>
                        <linearGradient
                          id="positiveGradient"
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
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                        <linearGradient
                          id="neutralGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#94a3b8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#94a3b8"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                        <linearGradient
                          id="negativeGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#ef4444"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#ef4444"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                        <linearGradient
                          id="totalGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                          borderRadius: "8px",
                          border: "1px solid #f0f0f0",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="positive"
                        name="Positive Feedback"
                        stackId="a"
                        fill="url(#positiveGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="neutral"
                        name="Neutral Feedback"
                        stackId="a"
                        fill="url(#neutralGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="negative"
                        name="Negative Feedback"
                        stackId="a"
                        fill="url(#negativeGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Trend Chart */}
            <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden rounded-lg border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sentiment Trend</CardTitle>
                <CardDescription>
                  Feedback sentiment across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {formatSentimentData().length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <AlertTriangle className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500 text-center">
                        No sentiment data available for this time period
                      </p>
                    </div>
                  ) : (
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
                          activeDot={{
                            r: 7,
                            stroke: "#16a34a",
                            strokeWidth: 2,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="neutral"
                          name="Neutral"
                          stroke="#737373"
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#737373" }}
                          activeDot={{
                            r: 6,
                            stroke: "#737373",
                            strokeWidth: 2,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="negative"
                          name="Negative"
                          stroke="#dc2626"
                          strokeWidth={2}
                          dot={{ r: 3, fill: "#dc2626" }}
                          activeDot={{
                            r: 6,
                            stroke: "#dc2626",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
                            {course.code}
                            <span className="mx-2">•</span>
                            <span className="text-xs text-gray-500">
                              {course.teacher}
                            </span>
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

          {/* Course Cards */}
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

  // Content for Departments tab
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
              {/* Department Cards - More Compact and Above Graph */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Departments Overview</h3>

                  {/* Pagination Controls (if departments > 5) */}
                  {departmentData.length > departmentsPerPage && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDepartmentPage(0)}
                        disabled={departmentPage === 0}
                      >
                        First
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDepartmentPage((prev) => Math.max(0, prev - 1))
                        }
                        disabled={departmentPage === 0}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center px-3 text-sm text-muted-foreground">
                        Page {departmentPage + 1} of {departmentPageCount}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDepartmentPage((prev) =>
                            Math.min(departmentPageCount - 1, prev + 1),
                          )
                        }
                        disabled={departmentPage === departmentPageCount - 1}
                      >
                        Next
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setDepartmentPage(departmentPageCount - 1)
                        }
                        disabled={departmentPage === departmentPageCount - 1}
                      >
                        Last
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedDepartments.map((dept) => {
                    // Calculate department metrics (more compact version)
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
                      <Card key={dept.id} className="overflow-hidden shadow-sm">
                        <div className="flex items-center p-3 border-b">
                          <div>
                            <h4 className="font-medium">{dept.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {dept.courses} courses • {dept.teachers} teachers
                              • {dept.students} students
                            </p>
                          </div>
                          <Badge
                            className={`ml-auto ${
                              sentimentScore > 70
                                ? "bg-emerald-100 text-emerald-800"
                                : sentimentScore > 40
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {sentimentScore}%
                          </Badge>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Feedback:
                            </span>
                            <span className="font-semibold">{total}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Response Rate:
                            </span>
                            <span className="font-semibold">
                              {responseRate}%
                            </span>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Sleek Department Comparison for Admin Analytics */}
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {selectedDepartment === "all"
                      ? "Department Comparison"
                      : "Course Performance"}
                  </CardTitle>
                  <CardDescription>
                    {selectedDepartment === "all"
                      ? "Compare engagement metrics across departments"
                      : `Courses in ${departments.find((d) => d.id === selectedDepartment)?.name || ""}`}
                  </CardDescription>
                  <div className="mt-2">
                    <Select
                      value={selectedDepartment}
                      onValueChange={setSelectedDepartment}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select department" />
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
                </CardHeader>
                <CardContent className="p-0">
                  {selectedDepartment === "all" ? (
                    <div className="pt-2 pb-4">
                      {departmentData.map((dept, idx) => {
                        // Calculate department metrics
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
                        const positiveSentiment =
                          total > 0 ? Math.round((positive / total) * 100) : 0;
                        const negativeSentiment =
                          total > 0 ? Math.round((negative / total) * 100) : 0;
                        const neutralSentiment =
                          total > 0 ? Math.round((neutral / total) * 100) : 0;
                        const responseRate =
                          dept.students > 0
                            ? Math.round((total / dept.students) * 100)
                            : 0;

                        // Calculate the class for alternating background rows
                        const rowBgClass =
                          idx % 2 === 0 ? "bg-muted/20" : "bg-transparent";

                        return (
                          <div key={idx} className={`px-6 py-4 ${rowBgClass}`}>
                            {/* Department header with metrics */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{dept.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({dept.courses} courses, {dept.teachers}{" "}
                                  teachers, {dept.students} students)
                                </span>
                              </div>
                              <div className="flex gap-4 items-center">
                                <div
                                  className="flex items-center"
                                  title="Total Feedback"
                                >
                                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                                  <span className="text-sm">{total}</span>
                                </div>
                                <div
                                  className="flex items-center"
                                  title="Response Rate"
                                >
                                  <Users className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                                  <span className="text-sm">
                                    {responseRate}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Sentiment bars */}
                            <div className="space-y-2.5">
                              {/* Sentiment distribution */}
                              <div className="relative h-6 w-full overflow-hidden rounded-md bg-muted">
                                {positiveSentiment > 0 && (
                                  <div
                                    className="absolute left-0 top-0 h-full bg-emerald-500 flex items-center justify-center text-xs font-medium text-white"
                                    style={{ width: `${positiveSentiment}%` }}
                                  >
                                    {positiveSentiment >= 10 &&
                                      `${positiveSentiment}%`}
                                  </div>
                                )}
                                {neutralSentiment > 0 && (
                                  <div
                                    className="absolute top-0 h-full bg-gray-400 flex items-center justify-center text-xs font-medium text-white"
                                    style={{
                                      left: `${positiveSentiment}%`,
                                      width: `${neutralSentiment}%`,
                                    }}
                                  >
                                    {neutralSentiment >= 10 &&
                                      `${neutralSentiment}%`}
                                  </div>
                                )}
                                {negativeSentiment > 0 && (
                                  <div
                                    className="absolute top-0 h-full bg-red-500 flex items-center justify-center text-xs font-medium text-white"
                                    style={{
                                      left: `${positiveSentiment + neutralSentiment}%`,
                                      width: `${negativeSentiment}%`,
                                    }}
                                  >
                                    {negativeSentiment >= 10 &&
                                      `${negativeSentiment}%`}
                                  </div>
                                )}
                              </div>

                              {/* Response rate visualization */}
                              <div className="mt-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-muted-foreground">
                                    Response Rate
                                  </span>
                                  <span className="text-xs font-medium">
                                    {responseRate}%
                                  </span>
                                </div>
                                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                  <div
                                    className="absolute left-0 top-0 h-full bg-blue-500"
                                    style={{ width: `${responseRate}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Trend indicators and labels */}
                              <div className="flex items-center justify-between text-xs px-0.5 mt-2">
                                <div className="flex gap-3">
                                  <div className="flex items-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-1.5"></div>
                                    <span>{positive} positive</span>
                                  </div>

                                  <div className="flex items-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-gray-400 mr-1.5"></div>
                                    <span>{neutral} neutral</span>
                                  </div>

                                  <div className="flex items-center">
                                    <div className="h-2.5 w-2.5 rounded-full bg-red-500 mr-1.5"></div>
                                    <span>{negative} negative</span>
                                  </div>
                                </div>

                                {/* Trend indicator */}
                                {total > 0 && (
                                  <div className="flex items-center">
                                    {positiveSentiment >= 70 ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                      >
                                        Very Positive
                                      </Badge>
                                    ) : positiveSentiment >= 50 ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                      >
                                        Positive
                                      </Badge>
                                    ) : negativeSentiment >= 70 ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-red-50 text-red-700 border-red-200"
                                      >
                                        Very Negative
                                      </Badge>
                                    ) : negativeSentiment >= 50 ? (
                                      <Badge
                                        variant="outline"
                                        className="bg-red-50 text-red-700 border-red-200"
                                      >
                                        Negative
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="bg-gray-50 text-gray-700 border-gray-200"
                                      >
                                        Mixed
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="pt-2 pb-4">
                      {getFilteredDepartmentCourses(selectedDepartment)
                        .sort((a, b) => b.feedbackCount - a.feedbackCount)
                        .slice(0, 10)
                        .map((course, idx) => {
                          // Calculate negative sentiment (since we already have positive in avgSentiment)
                          const negativePercent =
                            course.feedbackCount > 0
                              ? 100 -
                                course.avgSentiment -
                                Math.round(
                                  ((course.feedbackCount -
                                    (course.feedbackCount *
                                      course.avgSentiment) /
                                      100) /
                                    course.feedbackCount) *
                                    100,
                                )
                              : 0;

                          // Neutral sentiment is what's left
                          const neutralPercent =
                            100 - course.avgSentiment - negativePercent;

                          // Calculate the class for alternating background rows
                          const rowBgClass =
                            idx % 2 === 0 ? "bg-muted/20" : "bg-transparent";

                          return (
                            <div
                              key={idx}
                              className={`px-6 py-4 ${rowBgClass}`}
                            >
                              {/* Course header with metrics */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex-1 flex flex-wrap items-center gap-2">
                                  <span className="font-medium">
                                    {course.code}
                                  </span>
                                  <span className="text-xs text-muted-foreground max-w-[300px] truncate">
                                    {course.name}
                                  </span>
                                </div>
                                <div className="flex gap-4 items-center">
                                  <div
                                    className="flex items-center"
                                    title="Total Feedback"
                                  >
                                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600 mr-1.5" />
                                    <span className="text-sm">
                                      {course.feedbackCount}
                                    </span>
                                  </div>
                                  <div
                                    className="flex items-center"
                                    title="Response Rate"
                                  >
                                    <Users className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                                    <span className="text-sm">
                                      {course.responseRate}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Sentiment bars */}
                              <div className="space-y-2.5">
                                {/* Sentiment distribution */}
                                <div className="relative h-6 w-full overflow-hidden rounded-md bg-muted">
                                  {course.avgSentiment > 0 && (
                                    <div
                                      className="absolute left-0 top-0 h-full bg-emerald-500 flex items-center justify-center text-xs font-medium text-white"
                                      style={{
                                        width: `${course.avgSentiment}%`,
                                      }}
                                    >
                                      {course.avgSentiment >= 10 &&
                                        `${course.avgSentiment}%`}
                                    </div>
                                  )}
                                  {neutralPercent > 0 && (
                                    <div
                                      className="absolute top-0 h-full bg-gray-400 flex items-center justify-center text-xs font-medium text-white"
                                      style={{
                                        left: `${course.avgSentiment}%`,
                                        width: `${neutralPercent}%`,
                                      }}
                                    >
                                      {neutralPercent >= 10 &&
                                        `${neutralPercent}%`}
                                    </div>
                                  )}
                                  {negativePercent > 0 && (
                                    <div
                                      className="absolute top-0 h-full bg-red-500 flex items-center justify-center text-xs font-medium text-white"
                                      style={{
                                        left: `${course.avgSentiment + neutralPercent}%`,
                                        width: `${negativePercent}%`,
                                      }}
                                    >
                                      {negativePercent >= 10 &&
                                        `${negativePercent}%`}
                                    </div>
                                  )}
                                </div>

                                {/* Response rate visualization */}
                                <div className="mt-3">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-muted-foreground">
                                      Response Rate
                                    </span>
                                    <span className="text-xs font-medium">
                                      {course.responseRate}%
                                    </span>
                                  </div>
                                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="absolute left-0 top-0 h-full bg-blue-500"
                                      style={{
                                        width: `${course.responseRate}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Student count and event count */}
                                <div className="flex items-center justify-between text-xs mt-2">
                                  <div className="text-muted-foreground">
                                    {course.students} students •{" "}
                                    {course.eventCount} events
                                  </div>

                                  {/* Trend indicator */}
                                  {course.feedbackCount > 0 && (
                                    <div className="flex items-center">
                                      {course.avgSentiment >= 70 ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                        >
                                          Very Positive
                                        </Badge>
                                      ) : course.avgSentiment >= 50 ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-emerald-50 text-emerald-700 border-emerald-200"
                                        >
                                          Positive
                                        </Badge>
                                      ) : negativePercent >= 70 ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-red-50 text-red-700 border-red-200"
                                        >
                                          Very Negative
                                        </Badge>
                                      ) : negativePercent >= 50 ? (
                                        <Badge
                                          variant="outline"
                                          className="bg-red-50 text-red-700 border-red-200"
                                        >
                                          Negative
                                        </Badge>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className="bg-gray-50 text-gray-700 border-gray-200"
                                        >
                                          Mixed
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="px-6 py-3 border-t bg-muted/10 justify-between">
                  <div className="text-xs text-muted-foreground">
                    {selectedDepartment === "all"
                      ? `Showing ${Math.min(departmentData.length, departmentData.length)} departments`
                      : `Showing ${Math.min(getFilteredDepartmentCourses(selectedDepartment).length, 10)} courses from ${departments.find((d) => d.id === selectedDepartment)?.name || "department"}`}
                  </div>
                  {selectedDepartment !== "all" &&
                    getFilteredDepartmentCourses(selectedDepartment).length >
                      10 && (
                      <Button variant="link" size="sm" className="text-xs">
                        View All Courses
                      </Button>
                    )}
                </CardFooter>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );

  // Content for Feedback tab - UPDATED with event names
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
                {courses.map(
                  (course: { id: string; name: string; code: string }) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>

            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
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

        {/* Feedback List - Grouped by Events */}
        {feedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
            <p className="text-muted-foreground max-w-md">
              Feedback from students will appear here once they submit it using
              your course feedback codes.
            </p>
          </div>
        ) : getFilteredFeedback().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No matching feedback</h3>
            <p className="text-muted-foreground">
              Try adjusting your search filters to find what you&#39;re looking
              for.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSentimentFilter("all");
                setCourseFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              // Group feedback by events
              const eventGroups: Record<string, Feedback[]> = {};

              // First, group all feedback by event_id
              getFilteredFeedback().forEach((item) => {
                if (!eventGroups[item.event_id]) {
                  eventGroups[item.event_id] = [];
                }
                eventGroups[item.event_id].push(item);
              });

              // Create an array of event IDs sorted by date (most recent first)
              const sortedEventIds = Object.keys(eventGroups).sort((a, b) => {
                const eventA = events.find((e) => e.id === a);
                const eventB = events.find((e) => e.id === b);
                if (!eventA || !eventB) return 0;
                return (
                  new Date(eventB.created_at).getTime() -
                  new Date(eventA.created_at).getTime()
                );
              });

              // Render each event group
              return sortedEventIds.map((eventId) => {
                const event = events.find((e) => e.id === eventId);
                const eventFeedback = eventGroups[eventId];
                const course = event
                  ? courses.find(
                      (c: { id: string; code: string; name: string }) =>
                        c.id === event.course_id,
                    )
                  : null;

                return (
                  <div key={eventId} className="space-y-3">
                    <div className="border-b pb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                          {event ? (
                            <>
                              {/* Display event name if available, otherwise show date */}
                              {event.event_name ? (
                                <span>{event.event_name}</span>
                              ) : (
                                <span>
                                  Event on{" "}
                                  {new Date(
                                    event.event_date,
                                  ).toLocaleDateString()}
                                </span>
                              )}
                              {course && (
                                <span className="ml-1 text-muted-foreground">
                                  ({course.code})
                                </span>
                              )}
                            </>
                          ) : (
                            "Unknown Event"
                          )}
                        </h3>
                        <Badge variant="outline">
                          {eventFeedback.length}{" "}
                          {eventFeedback.length === 1
                            ? "response"
                            : "responses"}
                        </Badge>
                      </div>
                      {event && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="inline-flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Code: {event.entry_code || "N/A"}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Status:{" "}
                            {event.status
                              ? event.status.charAt(0).toUpperCase() +
                                event.status.slice(1)
                              : "Unknown"}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(
                              event.event_date,
                            ).toLocaleDateString()}{" "}
                            {new Date(event.event_date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pl-4 border-l-2 border-emerald-100 dark:border-emerald-900/30">
                      {eventFeedback.map((item) => (
                        <Card
                          key={item.id}
                          className="overflow-hidden hover:border-emerald-300 transition-colors cursor-pointer"
                          onClick={() => {
                            // Navigate to event details page if event exists
                            if (event) {
                              // Using the router hook instance
                              router.push(
                                `/dashboard/courses/${event.course_id}/events/${event.id}`,
                              );
                            }
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
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
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatRelativeTime(item.created_at)}
                                </span>
                              </div>
                            </div>
                            <p className="mb-0">{item.content}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );

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
