"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Book,
  Settings,
} from "lucide-react";

// This page shows analytics overview for the current teacher's courses
export default function AdminAnalyticsOverviewPage() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState("30");

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

  // Create tabs data for CustomTabs component
  const tabsData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </span>
      ),
      content: (
        <div className="space-y-6">
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
      ),
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
      content: <div></div>,
    },
  ];

  // Handle tab selection
  const handleTabChange = (index: number) => {
    if (index === 1) router.push("/admin-analytics/courses");
    else if (index === 2) router.push("/admin-analytics/feedback");
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
        defaultActiveIndex={0}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
