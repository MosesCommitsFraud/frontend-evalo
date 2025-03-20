"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

interface CreateEventDialogProps {
  children: React.ReactNode;
  courseId: string;
  onEventCreated?: (eventId: string, code: string) => void;
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

    setIsSubmitting(true);
    setError("");

    try {
      // Create event date from the form inputs
      const eventDate = new Date(`${date}T${timeFrom}`);
      const eventEndDate = new Date(`${date}T${timeUntil}`);

      // Generate a unique code for this event
      const entryCode = generateEventCode();

      const supabase = createClient();

      // Save the event to Supabase
      const { data, error } = await supabase
        .from("events")
        .insert({
          course_id: courseId,
          event_date: eventDate.toISOString(),
          status: "open", // Default to open
          entry_code: entryCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          positive_feedback_count: 0,
          negative_feedback_count: 0,
          neutral_feedback_count: 0,
          total_feedback_count: 0,
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
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      setError(error.message || "An unexpected error occurred");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create an Event</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Name */}
          <div>
            <Label htmlFor="event-name">Event Name</Label>
            <Input
              id="event-name"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Enter event name"
              required
              disabled={isSubmitting}
            />
          </div>
          {/* Short Event Description */}
          <div>
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter a short description"
              required
              disabled={isSubmitting}
            />
          </div>
          {/* Event Type Radio Group */}
          <div>
            <Label>Event Type</Label>
            <RadioGroup
              value={eventType}
              onValueChange={setEventType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="lecture" id="radio-lecture" />
                <Label htmlFor="radio-lecture">Lecture</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="webinar" id="radio-webinar" />
                <Label htmlFor="radio-webinar">Webinar</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem value="exercise" id="radio-exercise" />
                <Label htmlFor="radio-exercise">Exercise</Label>
              </div>
              <div className="flex items-center space-x-1">
                <RadioGroupItem
                  value="self-learning"
                  id="radio-self-learning"
                />
                <Label htmlFor="radio-self-learning">Self-learning</Label>
              </div>
            </RadioGroup>
          </div>
          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          {/* Timeslot */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="time-from">From</Label>
              <Input
                id="time-from"
                type="time"
                value={timeFrom}
                onChange={(e) => setTimeFrom(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="time-until">Until</Label>
              <Input
                id="time-until"
                type="time"
                value={timeUntil}
                onChange={(e) => setTimeUntil(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
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
