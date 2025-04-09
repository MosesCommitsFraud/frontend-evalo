"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, CalendarIcon, Clock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

// Type definitions
interface Course {
  id: string;
  name: string;
  code: string;
  owner_id: string;
  organization_id: string;
}

interface CustomCreateEventDialogProps {
  children: React.ReactNode;
  onEventCreated?: (eventId: string, code?: string) => void;
}

export default function CustomCreateEventDialog({
  children,
  onEventCreated,
}: CustomCreateEventDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("lecture");
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeUntil, setTimeUntil] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch courses when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchUserCourses();
    }
  }, [open, user]);

  // Fetch all courses where the user is the teacher (owner)
  const fetchUserCourses = async () => {
    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      const supabase = createClient();

      // Query courses where user is the owner
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, code, owner_id, organization_id")
        .eq("owner_id", user.id);

      if (error) {
        console.error("Error fetching courses:", error);
        setError("Failed to load your courses. Please try again.");
        return;
      }

      setCourses(data || []);

      // Auto-select the first course if available
      if (data && data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a random 4-character code
  const generateEventCode = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create an event");
      toast({
        title: "Error",
        description: "You must be logged in to create an event",
      });
      return;
    }

    if (!selectedCourseId) {
      setError("Please select a course for this event");
      toast({
        title: "Error",
        description: "Please select a course for this event",
      });
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Create event date from the form inputs
      const eventDate = new Date(`${date}T${timeFrom}`);

      // Generate a unique code for this event
      const entryCode = generateEventCode();

      const supabase = createClient();

      // Find the selected course to get organization_id
      const selectedCourse = courses.find(
        (course) => course.id === selectedCourseId,
      );

      if (!selectedCourse) {
        setError("Selected course not found");
        return;
      }

      // Save the event to Supabase with organization_id
      const { data, error } = await supabase
        .from("events")
        .insert({
          course_id: selectedCourseId,
          event_date: eventDate.toISOString(),
          status: "open", // Default to open
          entry_code: entryCode,
          organization_id: selectedCourse.organization_id,
          positive_feedback_count: 0,
          negative_feedback_count: 0,
          neutral_feedback_count: 0,
          total_feedback_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error("Error creating event:", error);
        setError(error.message);
        toast({
          title: "Error",
          description: `Failed to create event: ${error.message}`,
        });
        return;
      }

      if (data && data.length > 0) {
        const newEvent = data[0];
        console.log("Event created successfully:", newEvent);

        // Call the callback if provided
        if (onEventCreated) {
          onEventCreated(newEvent.id, entryCode);
        }

        // Show success message
        toast({
          title: "Success",
          description: `Event created with code: ${entryCode}`,
        });

        // Reset form and close dialog
        setEventName("");
        setDescription("");
        setEventType("lecture");
        setDate("");
        setTimeFrom("");
        setTimeUntil("");
        setSelectedCourseId("");
        setOpen(false);
      }
    } catch (error: unknown) {
      console.error("Error creating event:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Create an event to collect feedback. Students will use the generated
            code to provide anonymous feedback.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md flex gap-2 items-start mt-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <span className="ml-2">Loading courses...</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              You don&#39;t have any courses where you&#39;re the teacher.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="course-select">Course</Label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={isSubmitting}
              >
                <SelectTrigger id="course-select">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code}: {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Week 3 Lecture, Midterm Review"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this event"
                required
                disabled={isSubmitting}
                className="resize-none"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event-type">Event Type</Label>
              <Select
                value={eventType}
                onValueChange={setEventType}
                disabled={isSubmitting}
              >
                <SelectTrigger id="event-type">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lecture">Lecture</SelectItem>
                  <SelectItem value="seminar">Seminar</SelectItem>
                  <SelectItem value="lab">Lab Session</SelectItem>
                  <SelectItem value="review">Review Session</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time-from">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time-from"
                    type="time"
                    value={timeFrom}
                    onChange={(e) => setTimeFrom(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time-until">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time-until"
                    type="time"
                    value={timeUntil}
                    onChange={(e) => setTimeUntil(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Event"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
