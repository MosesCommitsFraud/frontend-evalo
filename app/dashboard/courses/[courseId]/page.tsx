"use client";

import React, { Suspense, useState, useEffect } from "react";
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
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { FeedbackAnalytics } from "@/components/feedback-analytics";
import CustomTabs from "@/components/custom-tabs";
import Link from "next/link";
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
import { dataService } from "@/lib/data-service";
import { toast } from "@/components/ui/toast";
import { Course } from "@/lib/data-service";

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  // Store courseId in a variable right away
  const courseId = params.courseId;

  // State for course data
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters on the share tab
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  // Fetch course data on component mount
  useEffect(() => {
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const { data, error } = await dataService.getCourseById(courseId);

        if (error) {
          console.error("Error fetching course:", error);
          setError(
            "Failed to load course information. Please try again later.",
          );
          toast({
            title: "Error",
            description: "Failed to load course information",
          });
          return;
        }

        if (data) {
          setCourse(data);
        } else {
          setError("Course not found");
        }
      } catch (err) {
        console.error("Exception fetching course:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

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

  // Empty state stats
  const emptyStats = [
    {
      title: "Total Responses",
      value: "0",
      description: "No share yet",
      icon: MessageSquare,
    },
    {
      title: "Sentiment Score",
      value: "N/A",
      description: "Waiting for share",
      icon: BarChart3,
    },
    {
      title: "Response Rate",
      value: "0%",
      description: "No responses yet",
      icon: BarChart3,
    },
    {
      title: "Total Students",
      value: course?.student_count?.toString() || "0",
      description: "Currently enrolled",
      icon: BarChart3,
    },
  ];

  // Empty share data (will be populated from the events and share tables later)
  const courseFeedbackData: any[] = [];

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
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
            </div>
          ) : error ? (
            <Card className="border-red-200 dark:border-red-800">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertTriangle className="h-10 w-10 text-red-500 mb-4" />
                <p className="text-lg font-medium">{error}</p>
                <p className="text-sm text-muted-foreground">
                  Please try again later
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {emptyStats.map((stat) => (
                  <StatsCard
                    key={stat.title}
                    title={stat.title}
                    value={stat.value}
                    description={stat.description}
                    icon={stat.icon}
                  />
                ))}
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
                      No feedback data available yet
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                    <CardDescription>At a glance metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="flex h-80 items-center justify-center rounded-md border border-dashed text-muted-foreground">
                    <div className="text-center">
                      <p>No statistics available yet</p>
                      <p className="text-sm mt-2">
                        Statistics will appear here once students submit
                        feedback
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
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
              View and analyze all feedback received for{" "}
              {course?.name || "this course"}
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

            {/* Empty State when no share */}
            {courseFeedbackData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Feedback from students will appear here once they submit it
                  using your course feedback code.
                </p>
                <Button
                  asChild
                  variant="default"
                  className="mt-4 gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Link href={`/dashboard/courses/${courseId}/share`}>
                    <QrCode className="h-4 w-4" />
                    Create Feedback Code
                  </Link>
                </Button>
              </div>
            ) : (
              <FeedbackList
                courseName={course?.name || "this course"}
                feedbackData={courseFeedbackData}
              />
            )}
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
            <div className="min-h-[400px] flex items-center justify-center rounded-md border p-6 text-center text-muted-foreground">
              <div className="text-center">
                <CalendarDays className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p>No events scheduled yet</p>
                <p className="text-sm mt-2">
                  Create events to track lectures, assignments, and other course
                  activities
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        {loading ? (
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <span className="mr-2">Loading course</span>
            <Loader2 className="h-6 w-6 animate-spin" />
          </h1>
        ) : (
          <h1 className="text-3xl font-bold tracking-tight">
            {course?.name || "Course Not Found"}
            {course?.code && (
              <span className="text-xl ml-2 text-muted-foreground font-normal">
                {course.code}
              </span>
            )}
          </h1>
        )}
        <div className="flex gap-2">
          {/* Share Feedback Code Button */}
          <Button
            asChild
            variant="default"
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            disabled={loading || !!error}
          >
            <Link href={`/dashboard/courses/${courseId}/share`}>
              <QrCode className="h-4 w-4" />
              Share Feedback Code
            </Link>
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            disabled={loading || !!error}
          >
            <Settings className="h-4 w-4" />
            Course Settings
          </Button>
        </div>
      </div>
      <CustomTabs tabs={tabData} />
    </div>
  );
}
