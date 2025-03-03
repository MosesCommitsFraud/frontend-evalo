"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Settings,
  Plus,
  CalendarIcon,
  Clock,
} from "lucide-react";
import { FeedbackAnalytics } from "@/components/feedback-analytics";
import ShareCourseDialog from "@/components/share-course-dialog";
import AddEventDialog from "@/components/add-event-dialog"; // Import the dialog component

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

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  const courseId = params.courseId;
  const courseName = getCourseNameById(courseId);

  // Sample data for upcoming events (to be shown in Dashboard tab)
  const upcomingEvents = [
    {
      id: "1",
      title: "Lecture on React",
      course: courseName,
      time: "10:00 AM",
      status: "open",
    },
    {
      id: "2",
      title: "Assignment Deadline",
      course: courseName,
      time: "3:00 PM",
      status: "pending",
    },
  ];

  // Sample data for events (used in the Events tab)
  const events = [
    {
      id: "1",
      title: "Lecture on React",
      course: courseName,
      time: "10:00 AM",
      status: "open",
    },
    {
      id: "2",
      title: "Assignment Deadline",
      course: courseName,
      time: "3:00 PM",
      status: "pending",
    },
    {
      id: "3",
      title: "Project Demo",
      course: courseName,
      time: "4:30 PM",
      status: "closed",
    },
    {
      id: "4",
      title: "Guest Lecture",
      course: courseName,
      time: "1:00 PM",
      status: "processed",
    },
    {
      id: "5",
      title: "Lab Session",
      course: courseName,
      time: "2:00 PM",
      status: "open",
    },
  ];

  // Filter events for each nested tab
  const allEvents = events;
  const openEvents = events.filter(
    (event) => event.status === "open" || event.status === "pending",
  );
  const closedEvents = events.filter((event) => event.status === "closed");
  const processedEvents = events.filter(
    (event) => event.status === "processed",
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header with course title and action buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{courseName}</h1>
        <div className="flex gap-2">
          {/* Wrap "Add Event" button with AddEventDialog */}
          <AddEventDialog>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </AddEventDialog>
          {/* Share Course Button using ShareCourseDialog */}
          <ShareCourseDialog courseId={courseId} />
          <Link href={`/dashboard/courses/${courseId}/settings`}>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Course Settings
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="event" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab Content */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Responses"
              value="124"
              description="+6 this week"
              icon={BarChart3}
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

          {/* Upcoming Events added to Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Your scheduled events for this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                    <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                      <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                        <CalendarIcon className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {event.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.course}
                        </p>
                        <span className="text-xs font-medium text-muted-foreground">
                          Status: {event.status}
                        </span>
                      </div>
                      <div className="ml-auto flex items-center">
                        <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {event.time}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab Content */}
        <TabsContent value="analytics">
          <Suspense fallback={<div>Loading analytics...</div>}>
            <FeedbackAnalytics courseId={courseId} />
          </Suspense>
        </TabsContent>

        {/* Events Tab Content with Nested Tabs */}
        <TabsContent value="event" className="space-y-4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="open">Open Events</TabsTrigger>
              <TabsTrigger value="closed">Closed Events</TabsTrigger>
              <TabsTrigger value="processed">Processed Events</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Events</CardTitle>
                  <CardDescription>Every event for this course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/dashboard/events/${event.id}`}
                      >
                        <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                            <CalendarIcon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.course}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                              Status: {event.status}
                            </span>
                          </div>
                          <div className="ml-auto flex items-center">
                            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {event.time}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="open" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Open Events</CardTitle>
                  <CardDescription>
                    Events that are currently open (or pending)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {openEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/dashboard/events/${event.id}`}
                      >
                        <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                            <CalendarIcon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.course}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                              Status: {event.status}
                            </span>
                          </div>
                          <div className="ml-auto flex items-center">
                            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {event.time}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="closed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Closed Events</CardTitle>
                  <CardDescription>Events that are now closed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {closedEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/dashboard/events/${event.id}`}
                      >
                        <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                            <CalendarIcon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.course}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                              Status: {event.status}
                            </span>
                          </div>
                          <div className="ml-auto flex items-center">
                            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {event.time}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="processed" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Processed Events</CardTitle>
                  <CardDescription>
                    Events that have been marked as processed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processedEvents.map((event) => (
                      <Link
                        key={event.id}
                        href={`/dashboard/events/${event.id}`}
                      >
                        <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                            <CalendarIcon className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {event.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {event.course}
                            </p>
                            <span className="text-xs font-medium text-muted-foreground">
                              Status: {event.status}
                            </span>
                          </div>
                          <div className="ml-auto flex items-center">
                            <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {event.time}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Calendar Tab Content */}
        <TabsContent value="calendar">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for Stats Card
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
