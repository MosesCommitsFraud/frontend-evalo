"use client";

import React, { useState } from "react";
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

interface CreateEventDialogProps {
  children: React.ReactNode;
  courseId: string;
  onEventCreated?: (eventId: string, code?: string) => void;
}

export default function CreateEventDialog({
  children,
  courseId,
  onEventCreated,
}: CreateEventDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("lecture");
  const [date, setDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeUntil, setTimeUntil] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Calculate event duration for the success message
  const getEventDuration = (startTime: string, endTime: string) => {
    try {
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);

      // Convert to minutes
      const startInMinutes = startHours * 60 + startMinutes;
      const endInMinutes = endHours * 60 + endMinutes;

      // Calculate duration in minutes
      const durationMinutes = endInMinutes - startInMinutes;

      if (durationMinutes < 60) {
        return `${durationMinutes} min`;
      } else {
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
      }
    } catch {
      return "1h"; // Default fallback
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

    // Validate event name
    if (!eventName.trim()) {
      setError("Please enter a name for the event");
      toast({
        title: "Error",
        description: "Please enter a name for the event",
      });
      return;
    }

    // Validate date and times
    if (!date) {
      setError("Please select a date");
      toast({
        title: "Error",
        description: "Please select a date for the event",
      });
      return;
    }

    if (!timeFrom) {
      setError("Please select a start time");
      toast({
        title: "Error",
        description: "Please select a start time for the event",
      });
      return;
    }

    if (!timeUntil) {
      setError("Please select an end time");
      toast({
        title: "Error",
        description: "Please select an end time for the event",
      });
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Create event date (start time) from the form inputs
      const eventDate = new Date(`${date}T${timeFrom}`);

      // Create end time from the form inputs
      const endTime = new Date(`${date}T${timeUntil}`);

      // Generate a unique code for this event
      const entryCode = generateEventCode();

      // Get organization_id from the associated course
      const supabase = createClient();
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("organization_id")
        .eq("id", courseId)
        .single();

      if (courseError || !course) {
        console.error("Error getting course:", courseError);
        setError("Failed to retrieve course information");
        return;
      }

      // Save the event to Supabase with organization_id, event_name, and end_time
      const { data, error } = await supabase
        .from("events")
        .insert({
          course_id: courseId,
          event_date: eventDate.toISOString(), // Start date and time
          event_name: eventName.trim(), // Add event name
          end_time: endTime.toISOString(), // Add end time
          status: "open", // Default to open
          entry_code: entryCode,
          organization_id: course.organization_id,
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

        // Calculate duration for the success message
        const duration = getEventDuration(timeFrom, timeUntil);

        // Call the callback if provided
        if (onEventCreated) {
          onEventCreated(newEvent.id, entryCode);
        }

        // Show success message
        toast({
          title: "Success",
          description: `Event "${eventName}" (${duration}) created with code: ${entryCode}`,
        });

        // Reset form and close dialog
        setEventName("");
        setDescription("");
        setEventType("lecture");
        setDate("");
        setTimeFrom("");
        setTimeUntil("");
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

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Event Name - ADDED THIS FIELD */}
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
      </DialogContent>
    </Dialog>
  );
}
