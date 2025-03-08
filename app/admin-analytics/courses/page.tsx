"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  Book,
  MessageSquare,
  Calendar,
  Clock,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsCoursesPage() {
  const router = useRouter();
  const [timePeriod, setTimePeriod] = useState("30");

  // Mock data for the teacher's courses
  const teacherCourses = [
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
  ];

  // Mock data for student activity time chart
  const studentActivityData = [
    { time: "Morning (6-12)", value: 32 },
    { time: "Afternoon (12-18)", value: 41 },
    { time: "Evening (18-24)", value: 52 },
    { time: "Night (0-6)", value: 18 },
  ];

  // Mock data for feedback submission by day
  const submissionByDayData = [
    { day: "Monday", count: 45 },
    { day: "Tuesday", count: 63 },
    { day: "Wednesday", count: 58 },
    { day: "Thursday", count: 72 },
    { day: "Friday", count: 51 },
    { day: "Saturday", count: 33 },
    { day: "Sunday", count: 29 },
  ];

  // Mock data for upcoming events
  const upcomingEvents = [
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
  ];

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
      content: (
        <div className="space-y-6">
          {/* Course Performance Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {teacherCourses.map((course) => (
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
                  When students are most active across your courses
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
                Important dates for your courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => {
                  const course = teacherCourses.find(
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
      ),
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
    if (index === 0) router.push("/analytics/overview");
    else if (index === 2) router.push("/analytics/feedback");
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
        defaultActiveIndex={1}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
