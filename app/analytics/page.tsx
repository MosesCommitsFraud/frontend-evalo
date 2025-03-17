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
} from "lucide-react";

export default function AnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [timePeriod, setTimePeriod] = useState("30");
  const [activeTab, setActiveTab] = useState(0);

  // Feedback filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  // Set default active tab on component mount
  useEffect(() => {
    // Initialize with the first tab selected
    setActiveTab(0);
  }, []);

  // Mock data for analytics
  // Mock data for the teacher's courses - in a real app, this would come from an API
  const teacherCourses = [
    { id: "course-1", name: "Introduction to Programming", code: "CS101" },
    { id: "course-3", name: "Web Development", code: "CS301" },
  ];

  // Mock data for analytics overview cards
  const overviewData = [
    {
      name: "Your Courses",
      value: teacherCourses.length,
      icon: <Book className="h-4 w-4 text-emerald-600" />,
      change: "+1",
      changeText: "from last semester",
    },
    {
      name: "Course Feedback",
      value: 324,
      icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
      change: "+8.2%",
      changeText: "from last month",
    },
    {
      name: "Active Students",
      value: 187,
      icon: <Users className="h-4 w-4 text-emerald-600" />,
      change: "+3.1%",
      changeText: "from last semester",
    },
    {
      name: "Response Rate",
      value: "73%",
      icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
      change: "+2.7%",
      changeText: "from last month",
    },
  ];

  // Mock data for course activity chart
  const activityData = [
    { month: "Jan", responses: 42, feedback: 29 },
    { month: "Feb", responses: 51, feedback: 32 },
    { month: "Mar", responses: 58, feedback: 40 },
    { month: "Apr", responses: 62, feedback: 45 },
    { month: "May", responses: 67, feedback: 48 },
    { month: "Jun", responses: 52, feedback: 35 },
    { month: "Jul", responses: 41, feedback: 29 },
    { month: "Aug", responses: 32, feedback: 22 },
    { month: "Sep", responses: 57, feedback: 38 },
    { month: "Oct", responses: 68, feedback: 47 },
    { month: "Nov", responses: 72, feedback: 51 },
    { month: "Dec", responses: 66, feedback: 43 },
  ];

  // Mock data for sentiment analysis
  const sentimentData = [
    { name: "Week 1", positive: 45, negative: 20, neutral: 35 },
    { name: "Week 2", positive: 49, negative: 17, neutral: 34 },
    { name: "Week 3", positive: 52, negative: 14, neutral: 34 },
    { name: "Week 4", positive: 58, negative: 11, neutral: 31 },
    { name: "Week 5", positive: 62, negative: 8, neutral: 30 },
  ];

  // Mock data for feedback categories
  const feedbackCategoriesData = [
    { name: "Course Content", value: 38 },
    { name: "Teaching Style", value: 27 },
    { name: "Materials", value: 14 },
    { name: "Assignments", value: 13 },
    { name: "Assessment", value: 8 },
  ];

  // Colors for pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  // Mock data for courses page
  const coursePageData = {
    teacherCourses: [
      {
        id: "course-1",
        name: "Introduction to Programming",
        code: "CS101",
        students: 42,
        feedbackCount: 128,
        responseRate: 76,
        avgSentiment: 85,
      },
      {
        id: "course-3",
        name: "Web Development",
        code: "CS301",
        students: 35,
        feedbackCount: 96,
        responseRate: 69,
        avgSentiment: 81,
      },
    ],
    studentActivityData: [
      { time: "Morning (6-12)", value: 32 },
      { time: "Afternoon (12-18)", value: 41 },
      { time: "Evening (18-24)", value: 52 },
      { time: "Night (0-6)", value: 18 },
    ],
    submissionByDayData: [
      { day: "Monday", count: 45 },
      { day: "Tuesday", count: 63 },
      { day: "Wednesday", count: 58 },
      { day: "Thursday", count: 72 },
      { day: "Friday", count: 51 },
      { day: "Saturday", count: 33 },
      { day: "Sunday", count: 29 },
    ],
    upcomingEvents: [
      {
        id: 1,
        courseId: "course-1",
        title: "Midterm Exam",
        date: "2025-03-15",
        time: "10:00 AM",
      },
      {
        id: 2,
        courseId: "course-3",
        title: "Project Submission",
        date: "2025-03-18",
        time: "11:59 PM",
      },
      {
        id: 3,
        courseId: "course-1",
        title: "Guest Lecture",
        date: "2025-03-22",
        time: "2:00 PM",
      },
    ],
  };

  // Mock data for feedback page
  const feedbackPageData = {
    sentimentData: [
      { name: "Positive", value: 62, color: "#16a34a" },
      { name: "Neutral", value: 27, color: "#737373" },
      { name: "Negative", value: 11, color: "#dc2626" },
    ],
    feedbackTypeData: [
      { name: "Course Content", value: 38, color: "#0088FE" },
      { name: "Teaching Style", value: 27, color: "#00C49F" },
      { name: "Materials", value: 14, color: "#FFBB28" },
      { name: "Assignments", value: 13, color: "#FF8042" },
      { name: "Assessment", value: 8, color: "#8884D8" },
    ],
    keywordsData: [
      { keyword: "Examples", count: 87 },
      { keyword: "Assignments", count: 76 },
      { keyword: "Lectures", count: 65 },
      { keyword: "Explanations", count: 58 },
      { keyword: "Clarity", count: 52 },
      { keyword: "Pace", count: 43 },
      { keyword: "Projects", count: 37 },
    ],
    recentFeedback: [
      {
        id: "1",
        courseId: "course-1",
        content:
          "The examples in today's lecture were very helpful for understanding the concept.",
        sentiment: "positive",
        date: "2025-03-06",
        keywords: ["examples", "lecture", "helpful"],
      },
      {
        id: "2",
        courseId: "course-3",
        content:
          "I'm struggling with the assignment requirements. Could you provide more details?",
        sentiment: "negative",
        date: "2025-03-05",
        keywords: ["assignment", "requirements", "struggling"],
      },
      {
        id: "3",
        courseId: "course-1",
        content:
          "The pace of the class is good, but I think we need more practice exercises.",
        sentiment: "neutral",
        date: "2025-03-04",
        keywords: ["pace", "practice", "exercises"],
      },
      {
        id: "4",
        courseId: "course-3",
        content:
          "Really enjoyed the project work today. The hands-on approach helps solidify concepts.",
        sentiment: "positive",
        date: "2025-03-03",
        keywords: ["project", "hands-on", "concepts"],
      },
      {
        id: "5",
        courseId: "course-1",
        content:
          "The quiz was much harder than expected based on the material covered in class.",
        sentiment: "negative",
        date: "2025-03-02",
        keywords: ["quiz", "difficult", "material"],
      },
    ],
  };

  // Filter feedback based on current filters
  const filteredFeedback = feedbackPageData.recentFeedback.filter(
    (feedback) => {
      // Search filter
      if (
        searchQuery &&
        !feedback.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Course filter
      if (courseFilter !== "all" && feedback.courseId !== courseFilter) {
        return false;
      }

      // Sentiment filter
      if (sentimentFilter !== "all" && feedback.sentiment !== sentimentFilter) {
        return false;
      }

      return true;
    },
  );

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

  // Get course name by ID
  const getCourseName = (courseId: string) => {
    const course = teacherCourses.find((c) => c.id === courseId);
    return course ? `${course.code}: ${course.name}` : "Unknown Course";
  };

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
            <CardTitle>Course Activity</CardTitle>
            <CardDescription>
              Monthly responses and feedback submissions for your courses
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
              Feedback sentiment across your courses
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
          <CardTitle>Feedback Categories</CardTitle>
          <CardDescription>
            Distribution of feedback by category
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

      {/* Your Courses Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Courses</CardTitle>
          <CardDescription>
            Quick overview of your active courses
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );

  // Content for Courses tab
  const coursesTabContent = (
    <div className="space-y-6">
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
                {course.students} enrolled students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Feedback</div>
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
                  <div className="text-sm text-muted-foreground">Sentiment</div>
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
              When students are most active across your courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePageData.studentActivityData}>
                  <XAxis dataKey="time" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
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
                  <XAxis dataKey="day" stroke="#888888" />
                  <YAxis stroke="#888888" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
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
                      {new Date(event.date).toLocaleDateString()} at{" "}
                      {event.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Content for Feedback tab
  const feedbackTabContent = (
    <div className="space-y-6">
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
                    data={feedbackPageData.sentimentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {feedbackPageData.sentimentData.map((entry, index) => (
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

        {/* Feedback Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Categories</CardTitle>
            <CardDescription>
              Distribution of feedback by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={feedbackPageData.feedbackTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                  >
                    {feedbackPageData.feedbackTypeData.map((entry, index) => (
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
      </div>

      {/* Top Keywords */}
      <Card>
        <CardHeader>
          <CardTitle>Top Feedback Keywords</CardTitle>
          <CardDescription>
            Most mentioned terms in student feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={feedbackPageData.keywordsData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 90, bottom: 5 }}
              >
                <XAxis type="number" />
                <YAxis
                  dataKey="keyword"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>Latest feedback from your courses</CardDescription>
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
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Course" />
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

              <Select
                value={sentimentFilter}
                onValueChange={setSentimentFilter}
              >
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
        </CardContent>
      </Card>
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
