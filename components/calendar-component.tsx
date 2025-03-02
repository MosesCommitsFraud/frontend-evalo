"use client";

import { useState } from "react";
import { addDays, format, startOfWeek, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Mock events data
const eventsMockData = [
  {
    id: "1",
    title: "Lecture: Introduction to APIs",
    date: new Date(2025, 2, 3, 10, 0),
    endTime: new Date(2025, 2, 3, 12, 0),
    status: "open",
    type: "lecture",
  },
  {
    id: "2",
    title: "Office Hours",
    date: new Date(2025, 2, 3, 14, 0),
    endTime: new Date(2025, 2, 3, 16, 0),
    status: "open",
    type: "office-hours",
  },
  {
    id: "3",
    title: "Assignment Due: Project Proposal",
    date: new Date(2025, 2, 5, 23, 59),
    endTime: new Date(2025, 2, 5, 23, 59),
    status: "closed",
    type: "deadline",
  },
  {
    id: "4",
    title: "Guest Lecture: Industry Perspectives",
    date: new Date(2025, 2, 7, 15, 0),
    endTime: new Date(2025, 2, 7, 17, 0),
    status: "open",
    type: "lecture",
  },
];

export function CalendarComponent({ courseId }: { courseId: string }) {
  const [currentDate] = useState(new Date());
  const [events] = useState(eventsMockData);
  const [open, setOpen] = useState(false);

  // Generate the dates for the current week
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Calendar</h2>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>
                Create a new event for your course calendar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="event-title">Title</Label>
                <Input id="event-title" placeholder="Event title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event-date">Date</Label>
                  <Input id="event-date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="event-time">Time</Label>
                  <Input id="event-time" type="time" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select>
                  <SelectTrigger id="event-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="office-hours">Office Hours</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event-status">Status</Label>
                <Select defaultValue="open">
                  <SelectTrigger id="event-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Weekly calendar view */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day) => (
          <div key={day.toString()} className="mb-4 text-center">
            <div className="mb-1 text-sm font-medium">{format(day, "EEE")}</div>
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center mx-auto mb-2 ${
                isSameDay(day, new Date())
                  ? "bg-emerald-100 text-emerald-700"
                  : ""
              }`}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className={`overflow-hidden ${
              event.status === "closed" ? "opacity-60" : ""
            }`}
          >
            <div
              className={`h-2 ${
                event.type === "lecture"
                  ? "bg-emerald-500"
                  : event.type === "office-hours"
                    ? "bg-blue-500"
                    : event.type === "deadline"
                      ? "bg-amber-500"
                      : "bg-gray-500"
              }`}
            />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{event.title}</CardTitle>
                <Badge
                  variant={event.status === "open" ? "outline" : "secondary"}
                >
                  {event.status}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                {format(event.date, "EEEE, MMMM d")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(event.date, "h:mm a")} -{" "}
                {format(event.endTime, "h:mm a")}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end pt-0">
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
