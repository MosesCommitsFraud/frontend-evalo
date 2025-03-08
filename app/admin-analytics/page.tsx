"use client";

import React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Book,
} from "lucide-react";

// Mock data for analytics
const overviewData = [
  {
    name: "Total Courses",
    value: 24,
    icon: <Book className="h-4 w-4 text-emerald-600" />,
    change: "+3",
    changeText: "from last semester",
  },
  {
    name: "Total Feedback",
    value: 897,
    icon: <MessageSquare className="h-4 w-4 text-emerald-600" />,
    change: "+12.5%",
    changeText: "from last month",
  },
  {
    name: "Total Students",
    value: 1242,
    icon: <Users className="h-4 w-4 text-emerald-600" />,
    change: "+5.7%",
    changeText: "from last semester",
  },
  {
    name: "Avg. Response Rate",
    value: "78%",
    icon: <TrendingUp className="h-4 w-4 text-emerald-600" />,
    change: "+4.2%",
    changeText: "from last month",
  },
];

// Mock data for course activity chart
const activityData = [
  { month: "Jan", responses: 120, feedback: 85 },
  { month: "Feb", responses: 145, feedback: 97 },
  { month: "Mar", responses: 162, feedback: 104 },
  { month: "Apr", responses: 170, feedback: 120 },
  { month: "May", responses: 180, feedback: 130 },
  { month: "Jun", responses: 155, feedback: 110 },
  { month: "Jul", responses: 140, feedback: 90 },
  { month: "Aug", responses: 130, feedback: 85 },
  { month: "Sep", responses: 170, feedback: 120 },
  { month: "Oct", responses: 190, feedback: 140 },
  { month: "Nov", responses: 220, feedback: 160 },
  { month: "Dec", responses: 205, feedback: 150 },
];

// Mock data for sentiment analysis
const sentimentData = [
  { name: "Week 1", positive: 40, negative: 24, neutral: 36 },
  { name: "Week 2", positive: 45, negative: 20, neutral: 35 },
  { name: "Week 3", positive: 50, negative: 15, neutral: 35 },
  { name: "Week 4", positive: 55, negative: 10, neutral: 35 },
  { name: "Week 5", positive: 60, negative: 5, neutral: 35 },
];

// Mock data for response rate by department
const departmentResponseData = [
  { name: "Computer Science", value: 82 },
  { name: "Engineering", value: 74 },
  { name: "Business", value: 65 },
  { name: "Mathematics", value: 78 },
  { name: "Physics", value: 70 },
];

// Mock data for top courses by feedback
const topCoursesData = [
  { name: "CS101: Intro to Programming", value: 94 },
  { name: "BUS202: Marketing Principles", value: 89 },
  { name: "ENG301: Circuit Design", value: 86 },
  { name: "CS301: Web Development", value: 85 },
  { name: "MATH201: Linear Algebra", value: 83 },
];

// Mock data for feedback categories distribution
const feedbackCategoriesData = [
  { name: "Course Content", value: 35 },
  { name: "Teaching Style", value: 25 },
  { name: "Materials", value: 15 },
  { name: "Assignments", value: 15 },
  { name: "Assessment", value: 10 },
];

// Colors for pie charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AnalyticsDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <div className="flex gap-2">
          <Select defaultValue="30">
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
        </div>
      </div>

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

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 md:w-auto w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Course Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Course Activity</CardTitle>
                <CardDescription>
                  Monthly responses and feedback submissions
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
                  Feedback sentiment analysis over time
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

          <div className="grid gap-6 md:grid-cols-2">
            {/* Response Rate by Department */}
            <Card>
              <CardHeader>
                <CardTitle>Response Rate by Department</CardTitle>
                <CardDescription>
                  Average response rates across departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={departmentResponseData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={150}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#10b981"
                        radius={[0, 4, 4, 0]}
                        label={{ position: "right", formatter: (v) => `${v}%` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

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
          </div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Courses by Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Top Courses by Response Rate</CardTitle>
                <CardDescription>
                  Courses with highest student participation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCoursesData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                    >
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        width={150}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="#60a5fa"
                        radius={[0, 4, 4, 0]}
                        label={{ position: "right", formatter: (v) => `${v}%` }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Course Activity Times */}
            <Card>
              <CardHeader>
                <CardTitle>Course Activity Times</CardTitle>
                <CardDescription>When students are most active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { time: "Morning (6-12)", value: 35 },
                        { time: "Afternoon (12-18)", value: 45 },
                        { time: "Evening (18-24)", value: 55 },
                        { time: "Night (0-6)", value: 20 },
                      ]}
                    >
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
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Feedback Volume */}
            <Card>
              <CardHeader>
                <CardTitle>Feedback Volume</CardTitle>
                <CardDescription>
                  Total feedback submissions over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { date: "Jan", value: 120 },
                        { date: "Feb", value: 140 },
                        { date: "Mar", value: 160 },
                        { date: "Apr", value: 185 },
                        { date: "May", value: 190 },
                        { date: "Jun", value: 170 },
                        { date: "Jul", value: 150 },
                        { date: "Aug", value: 140 },
                        { date: "Sep", value: 180 },
                        { date: "Oct", value: 220 },
                        { date: "Nov", value: 235 },
                        { date: "Dec", value: 225 },
                      ]}
                    >
                      <XAxis dataKey="date" stroke="#888888" />
                      <YAxis stroke="#888888" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Keywords */}
            <Card>
              <CardHeader>
                <CardTitle>Top Feedback Keywords</CardTitle>
                <CardDescription>
                  Most frequently mentioned terms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { keyword: "Assignments", count: 245 },
                        { keyword: "Lectures", count: 230 },
                        { keyword: "Clarity", count: 205 },
                        { keyword: "Explanations", count: 190 },
                        { keyword: "Examples", count: 175 },
                        { keyword: "Homework", count: 160 },
                        { keyword: "Quizzes", count: 140 },
                      ]}
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
                      <Bar
                        dataKey="count"
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
