"use client";

import React, { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CalendarDays,
  MessageSquare,
  Settings,
  QrCode,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Search,
  Filter,
} from "lucide-react";
import { FeedbackAnalytics } from "@/components/feedback-analytics";
import CustomTabs from "@/components/custom-tabs";
import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeedbackList } from "@/components/feedback-list";

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  // Unwrap params with React.use() as recommended by Next.js
  const unwrappedParams = React.use(params);
  // Store courseId in a variable right away
  const courseId = unwrappedParams.courseId;
  const courseName = getCourseNameById(courseId);

  // State for filters on the feedback tab
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  // Define your dashboard stats card component
  function StatsCard({
    title,
    value,
    description,
    icon: Icon,
  }: {
    title: string;
    value: string;
    description: string;
    icon: React.FC<{ className?: string }>;
  }) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    );
  }

  // Mock data for quick stats
  const quickStats = [
    { label: "Most Active Time", value: "Tuesdays, 10-12 AM" },
    { label: "Top Keyword", value: "Assignments" },
    { label: "Avg. Response Length", value: "3.2 paragraphs" },
    { label: "Common Feature Request", value: "More practice problems" },
    { label: "Improvement Area", value: "Assignment clarity" },
  ];

  // Mock feedback data for this course
  const courseFeedbackData = [
    {
      id: "1",
      content:
        "The examples in today's lecture were very helpful for understanding the concept.",
      sentiment: "positive",
      date: "2025-03-06",
      keywords: ["examples", "lecture", "helpful"],
    },
    {
      id: "2",
      content:
        "I'm struggling with the assignment requirements. Could you provide more details?",
      sentiment: "negative",
      date: "2025-03-05",
      keywords: ["assignment", "requirements", "struggling"],
    },
    {
      id: "3",
      content:
        "The pace of the class is good, but I think we need more practice exercises.",
      sentiment: "neutral",
      date: "2025-03-04",
      keywords: ["pace", "practice", "exercises"],
    },
    {
      id: "4",
      content:
        "Really enjoyed the project work today. The hands-on approach helps solidify concepts.",
      sentiment: "positive",
      date: "2025-03-03",
      keywords: ["project", "hands-on", "concepts"],
    },
    {
      id: "5",
      content:
        "The quiz was much harder than expected based on the material covered in class.",
      sentiment: "negative",
      date: "2025-03-02",
      keywords: ["quiz", "difficult", "material"],
    },
  ];

  // Filter feedback based on current filters
  const filteredFeedback = courseFeedbackData.filter((feedback) => {
    // Search filter
    if (
      searchQuery &&
      !feedback.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
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

  // Build your tab data array using your existing content from TabsContent
  const tabData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </span>
      ),
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Responses"
              value="124"
              description="+6 this week"
              icon={MessageSquare}
            />
            <StatsCard
              title="Sentiment Score"
              value="78%"
              description="+2% from last week"
              icon={BarChart3}
            />
            <StatsCard
              title="Response Rate"
              value="65%"
              description="Of enrolled students"
              icon={BarChart3}
            />
            <StatsCard
              title="Total Students"
              value="42"
              description="Currently enrolled"
              icon={BarChart3}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Categories</CardTitle>
                <CardDescription>
                  Distribution of feedback by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex h-full items-center justify-center rounded-md border border-dashed p-8 text-muted-foreground">
                  Category distribution chart
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>At a glance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm">{stat.label}</div>
                      <div className="font-medium">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </span>
      ),
      content: (
        <Suspense fallback={<div>Loading analytics...</div>}>
          <FeedbackAnalytics courseId={courseId} />
        </Suspense>
      ),
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </span>
      ),
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Student Feedback</CardTitle>
            <CardDescription>
              View and analyze all feedback received for {courseName}
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
            <FeedbackList
              courseName={courseName}
              feedbackData={courseFeedbackData}
            />
          </CardContent>
        </Card>
      ),
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Calendar
        </span>
      ),
      content: (
        <Card>
          <CardHeader>
            <CardTitle>Course Calendar</CardTitle>
            <CardDescription>
              Manage lectures, deadlines and office hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] rounded-md border p-6 text-center text-muted-foreground">
              Calendar view would go here
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{courseName}</h1>
        <div className="flex gap-2">
          {/* New QR Code Share Button */}
          <Button
            asChild
            variant="default"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Link href={`/dashboard/courses/${courseId}/share`}>
              <QrCode className="h-4 w-4" />
              Share Feedback Code
            </Link>
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Course Settings
          </Button>
        </div>
      </div>
      <CustomTabs tabs={tabData} />
    </div>
  );
}

// Helper function to get course name by ID
function getCourseNameById(id: string): string {
  const courses = {
    "course-1": "Introduction to Programming",
    "course-2": "Data Structures & Algorithms",
    "course-3": "Web Development",
    "course-4": "Machine Learning Basics",
    "course-5": "Database Systems",
  };

  return courses[id as keyof typeof courses] || "Unknown Course";
}
