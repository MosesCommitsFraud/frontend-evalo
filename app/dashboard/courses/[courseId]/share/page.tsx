"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CopyIcon,
  RefreshCw,
  Info,
  Plus,
  AlertTriangle,
  Loader2,
  Clock,
  BookOpen,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import CreateEventDialog from "@/components/create-event-dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import QRCode from "@/components/qrcode";
import { useParams } from "next/navigation";

// Define the interface for events
interface Event {
  id: string;
  course_id: string;
  event_date: string;
  status: string;
  entry_code: string;
  created_at: string;
  updated_at: string;
  positive_feedback_count: number;
  negative_feedback_count: number;
  neutral_feedback_count: number;
  total_feedback_count: number;
}

export default function CourseSharePage() {
  const { courseId } = useParams() as { courseId: string };

  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCodeResetDialogOpen, setIsCodeResetDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("newest");

  // Fetch course details and events on component mount
  useEffect(() => {
    const fetchCourseAndEvents = async () => {
      setIsLoading(true);
      try {
        const supabase = createClient();

        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single();

        if (courseError) {
          console.error("Error fetching course:", courseError);
          setError("Failed to load course information");
          return;
        }

        if (courseData) {
          setCourseName(courseData.name);
          setCourseCode(courseData.code);
        }

        // Fetch events for this course
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false });

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setError("Failed to load events");
          return;
        }

        if (eventsData) {
          setEvents(eventsData);
          // Select the most recent event if any exist
          if (eventsData.length > 0) {
            setSelectedEvent(eventsData[0]);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseAndEvents();
  }, [courseId]);

  // Function to handle copying the share code to clipboard
  const handleCopyCode = () => {
    if (!selectedEvent) return;

    navigator.clipboard.writeText(selectedEvent.entry_code);
    toast({
      title: "Copied!",
      description: "Feedback code copied to clipboard",
    });
  };

  // Function to handle copying the share link to clipboard
  const handleCopyLink = () => {
    if (!selectedEvent) return;

    const feedbackLink = `${window.location.origin}/student-feedback/${selectedEvent.entry_code}`;
    navigator.clipboard.writeText(feedbackLink);
    toast({
      title: "Copied!",
      description: "Feedback link copied to clipboard",
    });
  };

  // Function to handle code reset
  const handleCodeReset = async () => {
    if (!selectedEvent) return;

    try {
      // Generate a new random code (4 characters: letters and numbers)
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let newCode = "";
      for (let i = 0; i < 4; i++) {
        newCode += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .update({
          entry_code: newCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedEvent.id)
        .select();

      if (error) {
        console.error("Error resetting code:", error);
        toast({
          title: "Error",
          description: "Failed to reset the code. Please try again.",
        });
        return;
      }

      if (data && data.length > 0) {
        // Update the selected event with the new code
        const updatedEvent = data[0] as Event;
        setSelectedEvent(updatedEvent);

        // Update the event in the events list
        setEvents(
          events.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event,
          ),
        );

        toast({
          title: "Code Reset",
          description: "A new share code has been generated",
        });
      }
    } catch (error) {
      console.error("Error resetting code:", error);
      toast({
        title: "Error",
        description: "Failed to reset the code",
      });
    } finally {
      setIsCodeResetDialogOpen(false);
    }
  };

  // Handle new event created
  const handleEventCreated = (eventId: string) => {
    // Refresh the events list to include the new event
    const fetchEvents = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching events:", error);
          return;
        }

        if (data) {
          setEvents(data);
          // Find and select the newly created event
          const newEvent = data.find((event) => event.id === eventId);
          if (newEvent) {
            setSelectedEvent(newEvent);
            setActiveTab("newest"); // Switch to newest tab
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  };

  // Format date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Get the relative time description
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return `${Math.floor(diffDays / 30)} months ago`;
    }
  };

  // Check if the event is recent (less than 24 hours old)
  const isRecentEvent = (event: Event) => {
    const eventDate = new Date(event.created_at);
    const now = new Date();
    const diffTime = now.getTime() - eventDate.getTime();
    return diffTime < 24 * 60 * 60 * 1000; // Less than 24 hours
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Share Feedback Code
        </h1>
        <CreateEventDialog
          courseId={courseId}
          onEventCreated={handleEventCreated}
        >
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Event
          </Button>
        </CreateEventDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {courseCode}: {courseName}
          </CardTitle>
          <CardDescription>
            Share these codes with your students to collect feedback
          </CardDescription>
        </CardHeader>

        {isLoading ? (
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="ml-2">Loading...</span>
          </CardContent>
        ) : error ? (
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        ) : events.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No events yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Create an event to start collecting feedback from students. Each
              event will have its own unique code that students can use.
            </p>
            <CreateEventDialog
              courseId={courseId}
              onEventCreated={handleEventCreated}
            >
              <Button>Create Your First Event</Button>
            </CreateEventDialog>
          </CardContent>
        ) : (
          <CardContent>
            <Tabs
              defaultValue="newest"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="mb-4">
                <TabsTrigger value="newest">Newest Event</TabsTrigger>
                <TabsTrigger value="all">All Events</TabsTrigger>
              </TabsList>

              <TabsContent value="newest">
                {/* Display the most recent event */}
                {selectedEvent && (
                  <div className="flex flex-col items-center space-y-6">
                    {/* QR Code Display */}
                    <div className="flex flex-col items-center gap-6 p-6 border rounded-xl border-dashed">
                      <div className="h-64 w-64 bg-white border shadow-sm rounded-lg overflow-hidden flex items-center justify-center">
                        <QRCode
                          text={`${window.location.origin}/student-feedback/${selectedEvent.entry_code}`}
                          size={224}
                          level="M"
                        />
                      </div>

                      <div className="flex flex-col items-center">
                        <div className="text-3xl font-bold tracking-wider">
                          {selectedEvent.entry_code}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Students need this code to submit feedback
                        </p>
                      </div>
                    </div>

                    <div className="w-full space-y-2">
                      <Label htmlFor="feedback-url">Share Link</Label>
                      <div className="flex gap-2">
                        <Input
                          id="feedback-url"
                          value={`${window.location.origin}/student-feedback/${selectedEvent.entry_code}`}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={handleCopyLink}
                          className="gap-2"
                        >
                          <CopyIcon className="h-4 w-4" />
                          Copy
                        </Button>
                      </div>
                    </div>

                    <div className="w-full">
                      <Separator className="my-4" />
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Event Info</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatEventDate(selectedEvent.event_date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {selectedEvent.total_feedback_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {selectedEvent.positive_feedback_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Positive
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {selectedEvent.neutral_feedback_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Neutral
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">
                              {selectedEvent.negative_feedback_count}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Negative
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className={`cursor-pointer hover:border-emerald-300 transition-colors ${selectedEvent?.id === event.id ? "border-emerald-500" : ""}`}
                      onClick={() => {
                        setSelectedEvent(event);
                        setActiveTab("newest");
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-emerald-600" />
                            <h3 className="font-medium">
                              {formatEventDate(event.event_date)}
                            </h3>
                            {isRecentEvent(event) && (
                              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
                                New
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline">{event.entry_code}</Badge>
                        </div>

                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{getRelativeTime(event.created_at)}</span>
                          </div>
                          <div>{event.total_feedback_count} responses</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}

        {selectedEvent && (
          <CardFooter className="flex justify-between">
            <div>
              <Button
                variant="outline"
                onClick={handleCopyCode}
                className="gap-2"
              >
                <CopyIcon className="h-4 w-4" />
                Copy Code
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setIsCodeResetDialogOpen(true)}
              >
                <RefreshCw className="h-4 w-4" />
                Reset Code
              </Button>
              <Button onClick={() => window.print()}>Print QR Code</Button>
            </div>
          </CardFooter>
        )}
      </Card>

      <div className="flex items-center p-4 border rounded-lg bg-muted/50">
        <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
        <p className="text-sm text-muted-foreground">
          Each event has its own unique code. Students can use this code to
          submit anonymous feedback. You can create multiple events for
          different classes or lectures.
        </p>
      </div>

      {/* Reset Code Dialog */}
      <Dialog
        open={isCodeResetDialogOpen}
        onOpenChange={setIsCodeResetDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Feedback Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the feedback code? The current code
              ({selectedEvent?.entry_code}) will no longer work, and students
              will need the new code.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-destructive font-medium">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCodeResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCodeReset}>
              Reset Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
