"use client";

import React, { useState, useEffect } from "react";
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
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Plus,
  Info,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  CalendarIcon,
} from "lucide-react";
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
import { dataService } from "@/lib/data-service";
import { toast } from "@/components/ui/toast";
import { Course } from "@/lib/data-service";
import CreateEventDialog from "@/components/create-event-dialog";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Event {
  id: string;
  course_id: string;
  event_date: string;
  status: "open" | "closed" | "archived";
  entry_code: string;
  created_at: string;
  updated_at: string;
  positive_feedback_count: number;
  negative_feedback_count: number;
  neutral_feedback_count: number;
  total_feedback_count: number;
}

interface FeedbackItem {
  id: string;
  event_id: string;
  content: string;
  tone: "positive" | "negative" | "neutral";
  is_reviewed: boolean;
  created_at: string;
}

const use =
  React.use ||
  (<T,>(promise: T | Promise<T>): T =>
    promise instanceof Promise ? (promise as unknown as T) : promise);

export default function CoursePage(props: {
  params: { courseId: string } | Promise<{ courseId: string }>;
}) {
  // Unwrap params using React.use if it's a Promise
  const params = use(props.params);
  const courseId = params.courseId;

  // State for course data
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for events and feedback
  const [events, setEvents] = useState<Event[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // State for filters on the feedback tab
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [eventFilter, setEventFilter] = useState("all");

  // State for events tab
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [activeEventsTab, setActiveEventsTab] = useState("upcoming");

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

  // Fetch events and feedback data
  useEffect(() => {
    const fetchEventsAndFeedback = async () => {
      setLoadingEvents(true);
      setLoadingFeedback(true);

      try {
        const supabase = createClient();

        // Fetch events for this course
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("course_id", courseId)
          .order("event_date", { ascending: true });

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setEventError("Failed to load events");
        } else {
          setEvents(eventsData || []);

          // If we have events, fetch their feedback
          if (eventsData && eventsData.length > 0) {
            const eventIds = eventsData.map((event) => event.id);

            const { data: feedbackData, error: feedbackError } = await supabase
              .from("feedback")
              .select("*")
              .in("event_id", eventIds)
              .order("created_at", { ascending: false });

            if (feedbackError) {
              console.error("Error fetching feedback:", feedbackError);
              setFeedbackError("Failed to load feedback");
            } else {
              setFeedback(feedbackData || []);
            }
          }
        }
      } catch (err) {
        console.error("Exception fetching events and feedback:", err);
        setEventError("An unexpected error occurred");
        setFeedbackError("An unexpected error occurred");
      } finally {
        setLoadingEvents(false);
        setLoadingFeedback(false);
      }
    };

    fetchEventsAndFeedback();
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
      value: feedback.length.toString(),
      description: feedback.length
        ? `Across ${events.length} events`
        : "No feedback yet",
      icon: MessageSquare,
    },
    {
      title: "Sentiment Score",
      value: feedback.length ? "Calculating..." : "N/A",
      description: feedback.length
        ? "Based on feedback analysis"
        : "Waiting for feedback",
      icon: BarChart3,
    },
    {
      title: "Response Rate",
      value: events.length
        ? `${Math.round((feedback.length / events.length) * 100)}%`
        : "0%",
      description: events.length ? "Average per event" : "No events yet",
      icon: BarChart3,
    },
    {
      title: "Total Students",
      value: course?.student_count?.toString() || "0",
      description: "Currently enrolled",
      icon: BarChart3,
    },
  ];

  // Format date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Helper to check if an event is in the future
  const isUpcomingEvent = (event: Event) => {
    return new Date(event.event_date) > new Date();
  };

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

  // Get event name by id
  const getEventName = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return "Unknown Event";

    const date = new Date(event.event_date);
    return `Event on ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Handle event creation callback
  const handleEventCreated = () => {
    // Refresh events and feedback data
    const fetchEvents = async () => {
      try {
        const supabase = createClient();

        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("course_id", courseId)
          .order("event_date", { ascending: true });

        if (eventsError) {
          console.error("Error refreshing events:", eventsError);
          return;
        }

        setEvents(eventsData || []);
      } catch (err) {
        console.error("Error refreshing events:", err);
      }
    };

    fetchEvents();
  };

  // Handle status change for events
  const handleStatusChange = async (
    eventId: string,
    newStatus: "open" | "closed" | "archived",
  ) => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("events")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .select();

      if (error) {
        console.error("Error updating event status:", error);
        toast({
          title: "Error",
          description: "Failed to update event status",
        });
        return;
      }

      if (data && data.length > 0) {
        // Update the local events
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? { ...event, status: newStatus } : event,
          ),
        );

        // Close the dialog
        setConfirmDialogOpen(false);
        setSelectedEvent(null);

        toast({
          title: "Success",
          description: `Event status updated to ${newStatus}`,
        });
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
      });
    }
  };

  // Filter feedback based on current filters
  const filteredFeedback = feedback.filter((item) => {
    // Search filter
    if (
      searchQuery &&
      !item.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Sentiment filter
    if (sentimentFilter !== "all" && item.tone !== sentimentFilter) {
      return false;
    }

    // Event filter
    if (eventFilter !== "all" && item.event_id !== eventFilter) {
      return false;
    }

    return true;
  });

  // Filter events based on search and status
  const filteredEvents = events.filter((event) => {
    // Filter by search query (date)
    if (
      searchQuery &&
      !formatEventDate(event.event_date)
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Filter by status
    if (statusFilter !== "all" && event.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Dashboard Tab Content
  const dashboardTabContent = (
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
                    Statistics will appear here once students submit feedback
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );

  // Analytics Tab Content
  const analyticsTabContent = (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Analytics</CardTitle>
          <CardDescription>
            View insights and trends from student feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">No analytics data available yet</p>
              <p className="text-sm mt-1">
                Analytics will be displayed here once students start submitting
                feedback for your course events. Create an event and share the
                feedback code to start collecting data.
              </p>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview Placeholder */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Feedback Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-60">
                    <PieChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No data to display yet
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Feedback Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center h-60">
                    <LineChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No data to display yet
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
                    <Card className="bg-muted/40">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Total Feedback
                        </p>
                        <p className="text-2xl font-bold mt-1">-</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Positive Feedback
                        </p>
                        <p className="text-2xl font-bold mt-1">-</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Neutral Feedback
                        </p>
                        <p className="text-2xl font-bold mt-1">-</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-muted/40">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">
                          Negative Feedback
                        </p>
                        <p className="text-2xl font-bold mt-1">-</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              {/* Trends Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sentiment Trends</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-80">
                  <LineChartIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No trend data available yet
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Popular Topics</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-60">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No topic data available yet
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sentiment" className="space-y-6">
              {/* Sentiment Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-80">
                  <ThumbsUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No sentiment data available yet
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  // Feedback Tab Content
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
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {new Date(event.event_date).toLocaleDateString()}
                  </SelectItem>
                ))}
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

        {/* Feedback List */}
        {loadingFeedback ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="ml-2">Loading feedback...</span>
          </div>
        ) : feedbackError ? (
          <div className="flex items-center justify-center py-12">
            <AlertTriangle className="h-8 w-8 text-amber-500 mr-2" />
            <span>{feedbackError}</span>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            {feedback.length === 0 ? (
              <>
                <h3 className="text-lg font-medium mb-2">No feedback yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Feedback from students will appear here once they submit it
                  using your course feedback codes.
                </p>
                <Button asChild className="mt-4 gap-2">
                  <Link href={`/dashboard/courses/${courseId}/share`}>
                    <QrCode className="h-4 w-4" />
                    Share Feedback Code
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">
                  No matching feedback
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search filters to find what you&#39;re
                  looking for.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSentimentFilter("all");
                    setEventFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="mb-3">{item.content}</p>

                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    <span>{getEventName(item.event_id)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Events Tab Content (formerly Calendar)
  const eventsTabContent = (
    <Card>
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>
          Manage all feedback events for this course
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter and Action Bar */}
        <div className="flex flex-col gap-4 sm:flex-row justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CreateEventDialog
            courseId={courseId}
            onEventCreated={handleEventCreated}
          >
            <Button className="shrink-0 gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </CreateEventDialog>
        </div>

        {/* Events List */}
        {loadingEvents ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="ml-2">Loading events...</span>
          </div>
        ) : eventError ? (
          <div className="flex items-center justify-center py-12">
            <AlertTriangle className="h-8 w-8 text-amber-500 mr-2" />
            <span>{eventError}</span>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events yet</h3>
            <p className="text-muted-foreground max-w-md">
              Create your first event to start collecting feedback from
              students.
            </p>
            <CreateEventDialog
              courseId={courseId}
              onEventCreated={handleEventCreated}
            >
              <Button className="mt-4">Create Your First Event</Button>
            </CreateEventDialog>
          </div>
        ) : (
          <Tabs
            defaultValue="upcoming"
            value={activeEventsTab}
            onValueChange={setActiveEventsTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
              <TabsTrigger value="all">All Events</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {filteredEvents.filter(isUpcomingEvent).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No upcoming events found
                </div>
              ) : (
                filteredEvents.filter(isUpcomingEvent).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onStatusChange={() => {
                      setSelectedEvent(event);
                      setConfirmDialogOpen(true);
                    }}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {filteredEvents.filter((e) => !isUpcomingEvent(e)).length ===
              0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No past events found
                </div>
              ) : (
                filteredEvents
                  .filter((e) => !isUpcomingEvent(e))
                  .map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onStatusChange={() => {
                        setSelectedEvent(event);
                        setConfirmDialogOpen(true);
                      }}
                    />
                  ))
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No events found matching your criteria
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onStatusChange={() => {
                      setSelectedEvent(event);
                      setConfirmDialogOpen(true);
                    }}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      {/* Confirm Status Change Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Event Status</DialogTitle>
            <DialogDescription>
              {selectedEvent && (
                <>
                  Update the status for the event on{" "}
                  {formatEventDate(selectedEvent.event_date)}. This will affect
                  whether students can submit feedback.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Select
              defaultValue={selectedEvent?.status}
              onValueChange={(value) => {
                if (
                  selectedEvent &&
                  ["open", "closed", "archived"].includes(value)
                ) {
                  handleStatusChange(
                    selectedEvent.id,
                    value as "open" | "closed" | "archived",
                  );
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open (accepting feedback)</SelectItem>
                <SelectItem value="closed">Closed (no new feedback)</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Open:</strong> Students can submit feedback using the
                event code.
              </p>
              <p>
                <strong>Closed:</strong> No new feedback can be submitted, but
                the event is still visible.
              </p>
              <p>
                <strong>Archived:</strong> Event is hidden from default views
                but not deleted.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setConfirmDialogOpen(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );

  // Build your tab data array using your content
  const tabData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Dashboard
        </span>
      ),
      content: dashboardTabContent,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </span>
      ),
      content: analyticsTabContent,
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
    {
      label: (
        <span className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Events
        </span>
      ),
      content: eventsTabContent,
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
              Create/Share Feedback Code
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

// Event Card Component
interface EventCardProps {
  event: Event;
  onStatusChange: () => void;
}

function EventCard({ event, onStatusChange }: EventCardProps) {
  const getRelativeTime = (dateString: string) => {
    const eventDate = new Date(dateString);
    const today = new Date();

    // Reset time part for accurate day comparison
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(eventDate);
    compareDate.setHours(0, 0, 0, 0);

    const diffTime = compareDate.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 0) {
      if (diffDays === -1) return "Yesterday";
      if (diffDays > -7) return `${Math.abs(diffDays)} days ago`;
      return new Date(dateString).toLocaleDateString();
    }
    return new Date(dateString).toLocaleDateString();
  };

  // Format date
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Open
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
            <XCircle className="h-3 w-3 mr-1" />
            Closed
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-emerald-600" />
            <h3 className="font-medium">{formatEventDate(event.event_date)}</h3>
            <Badge variant="outline" className="ml-2">
              Code: {event.entry_code}
            </Badge>
          </div>
          {getStatusBadge(event.status)}
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{getRelativeTime(event.event_date)}</span>
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-3 w-3" />
              <span>{event.total_feedback_count} responses</span>
            </div>
          </div>

          <div>
            <Button variant="outline" size="sm" onClick={onStatusChange}>
              Change Status
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
