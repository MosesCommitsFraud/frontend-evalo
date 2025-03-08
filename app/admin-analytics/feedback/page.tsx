"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
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
  Book,
  MessageSquare,
  Search,
  Filter,
  Settings,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";

export default function AdminAnalyticsFeedbackPage() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState("30");
  const [searchQuery, setSearchQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  // Mock data for the teacher's courses
  const teacherCourses = [
    { id: "course-1", name: "Introduction to Programming", code: "CS101" },
    { id: "course-3", name: "Web Development", code: "CS301" },
  ];

  // Mock data for feedback keywords
  const keywordsData = [
    { keyword: "Examples", count: 87 },
    { keyword: "Assignments", count: 76 },
    { keyword: "Lectures", count: 65 },
    { keyword: "Explanations", count: 58 },
    { keyword: "Clarity", count: 52 },
    { keyword: "Pace", count: 43 },
    { keyword: "Projects", count: 37 },
  ];

  // Mock data for sentiment distribution
  const sentimentData = [
    { name: "Positive", value: 62, color: "#16a34a" },
    { name: "Neutral", value: 27, color: "#737373" },
    { name: "Negative", value: 11, color: "#dc2626" },
  ];

  // Mock data for feedback type distribution
  const feedbackTypeData = [
    { name: "Course Content", value: 38, color: "#0088FE" },
    { name: "Teaching Style", value: 27, color: "#00C49F" },
    { name: "Materials", value: 14, color: "#FFBB28" },
    { name: "Assignments", value: 13, color: "#FF8042" },
    { name: "Assessment", value: 8, color: "#8884D8" },
  ];

  // Mock data for recent feedback
  const recentFeedback = [
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
  ];

  // Filter feedback based on current filters
  const filteredFeedback = recentFeedback.filter((feedback) => {
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
  });

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

  // Create tabs data for CustomTabs component
  const tabsData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </span>
      ),
      content: <div></div>,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Book className="h-4 w-4" />
          Courses
        </span>
      ),
      content: <div></div>,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </span>
      ),
      content: (
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
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                      >
                        {sentimentData.map((entry, index) => (
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
                        data={feedbackTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}%`}
                      >
                        {feedbackTypeData.map((entry, index) => (
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
                    data={keywordsData}
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
              <CardDescription>
                Latest feedback from your courses
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

              {/* Feedback List */}
              <div className="space-y-4">
                {filteredFeedback.length === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-md border text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-8 w-8" />
                      <p>No feedback matches your filters</p>
                    </div>
                  </div>
                ) : (
                  filteredFeedback.map((feedback) => (
                    <Card key={feedback.id}>
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={
                                feedback.sentiment === "positive"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  : feedback.sentiment === "negative"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                              }
                            >
                              <span className="flex items-center gap-1">
                                {getSentimentIcon(feedback.sentiment)}
                                {feedback.sentiment.charAt(0).toUpperCase() +
                                  feedback.sentiment.slice(1)}
                              </span>
                            </Badge>
                            <Badge variant="outline">
                              {getCourseName(feedback.courseId)}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(feedback.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mb-3">{feedback.content}</p>
                        <div className="flex flex-wrap gap-1">
                          {feedback.keywords.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-blue-50 dark:bg-blue-900/10"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ),
    },
  ];

  // Handle tab selection
  const handleTabChange = (index: number) => {
    if (index === 0) router.push("/admin-analytics/overview");
    else if (index === 1) router.push("/admin-analytics/courses");
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
        defaultActiveIndex={2}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
