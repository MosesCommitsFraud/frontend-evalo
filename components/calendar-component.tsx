"use client";

import React from "react";
import { useState } from "react";
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfToday,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for courses
const courses = [
  { id: "course-1", name: "Introduction to Programming", code: "CS101" },
  { id: "course-2", name: "Data Structures & Algorithms", code: "CS201" },
  { id: "course-3", name: "Web Development", code: "CS301" },
  { id: "course-4", name: "Machine Learning Basics", code: "CS401" },
  { id: "course-5", name: "Database Systems", code: "CS202" },
];

// Mock data for events
const events = [
  {
    id: "event-1",
    title: "CS101 Lecture",
    courseId: "course-1",
    date: "2025-03-10T10:00",
    endTime: "2025-03-10T12:00",
    type: "lecture",
  },
  {
    id: "event-2",
    title: "CS201 Office Hours",
    courseId: "course-2",
    date: "2025-03-10T14:00",
    endTime: "2025-03-10T16:00",
    type: "office-hours",
  },
  {
    id: "event-3",
    title: "CS301 Project Deadline",
    courseId: "course-3",
    date: "2025-03-15T23:59",
    endTime: "2025-03-15T23:59",
    type: "deadline",
  },
  {
    id: "event-4",
    title: "CS401 Guest Lecture",
    courseId: "course-4",
    date: "2025-03-18T15:00",
    endTime: "2025-03-18T17:00",
    type: "lecture",
  },
  {
    id: "event-5",
    title: "CS202 Lab Session",
    courseId: "course-5",
    date: "2025-03-20T10:00",
    endTime: "2025-03-20T12:00",
    type: "lab",
  },
  {
    id: "event-6",
    title: "CS101 Midterm Exam",
    courseId: "course-1",
    date: "2025-03-22T09:00",
    endTime: "2025-03-22T11:00",
    type: "exam",
  },
];

// Type definitions for TypeScript
interface Course {
  id: string;
  name: string;
  code: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  courseId: string;
  date: string;
  endTime: string;
  type: string;
}

function getEventBadgeColor(type: string) {
  switch (type) {
    case "lecture":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100";
    case "exam":
      return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100";
    case "deadline":
      return "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100";
    case "office-hours":
      return "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100";
    case "lab":
      return "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
  }
}

function getFormattedEventTime(event: CalendarEvent) {
  const startTime = parseISO(event.date);
  const endTime = parseISO(event.endTime);

  return `${format(startTime, "h:mm a")} - ${format(endTime, "h:mm a")}`;
}

function getCourseById(id: string) {
  return (
    courses.find((course) => course.id === id) || {
      name: "Unknown Course",
      code: "Unknown",
    }
  );
}

export default function CalendarPage() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const [selectedCourse, setSelectedCourse] = useState("all");

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  function previousMonth() {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayPreviousMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  // Filter events based on selected course and day
  const filteredEvents = events.filter((event) => {
    const eventDate = parseISO(event.date);

    // Always filter by selected day
    const sameDay = isSameDay(eventDate, selectedDay);

    // Filter by course if not "all"
    const matchesCourse =
      selectedCourse === "all" || event.courseId === selectedCourse;

    return sameDay && matchesCourse;
  });

  // Check if a day has events for visual indicators
  function getDayHasEvents(day: Date) {
    const dayEvents = events.filter((event) => {
      const eventDate = parseISO(event.date);
      const sameDay = isSameDay(eventDate, day);
      const matchesCourse =
        selectedCourse === "all" || event.courseId === selectedCourse;

      return sameDay && matchesCourse;
    });

    return dayEvents.length > 0;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <div className="flex gap-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code}: {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl">
            {format(firstDayCurrentMonth, "MMMM yyyy")}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-sm leading-6 text-muted-foreground">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map((day, dayIdx) => {
              const hasEvents = getDayHasEvents(day);
              const sameDayAsToday = isToday(day);
              const sameDayAsSelected = isSameDay(day, selectedDay);

              // Offset for first week of the month
              const startingDayOfWeek = getDay(days[0]);

              if (dayIdx === 0) {
                return (
                  <React.Fragment key={day.toString()}>
                    {startingDayOfWeek > 0 && (
                      <div
                        className="col-span-1"
                        style={{
                          gridColumnStart: 1,
                          gridColumnEnd: startingDayOfWeek + 1,
                          display: "none",
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "h-12 rounded-md",
                        !isSameMonth(day, firstDayCurrentMonth) &&
                          "text-gray-400 opacity-50",
                        sameDayAsToday &&
                          "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
                        sameDayAsSelected &&
                          "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
                        !sameDayAsSelected &&
                          !sameDayAsToday &&
                          "hover:bg-gray-100 dark:hover:bg-gray-800",
                        (sameDayAsSelected || sameDayAsToday) &&
                          "font-semibold",
                        hasEvents &&
                          !sameDayAsSelected &&
                          !sameDayAsToday &&
                          "ring-1 ring-inset ring-emerald-500",
                        startingDayOfWeek > 0 &&
                          `col-start-${startingDayOfWeek + 1}`,
                      )}
                      style={{
                        gridColumn: `${startingDayOfWeek + 1} / span 1`,
                      }}
                    >
                      <time dateTime={format(day, "yyyy-MM-dd")}>
                        {format(day, "d")}
                      </time>
                      {hasEvents && (
                        <div className="w-1.5 h-1.5 mx-auto mt-1 rounded-full bg-emerald-500" />
                      )}
                    </button>
                  </React.Fragment>
                );
              }

              return (
                <button
                  key={day.toString()}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "h-12 rounded-md",
                    !isSameMonth(day, firstDayCurrentMonth) &&
                      "text-gray-400 opacity-50",
                    sameDayAsToday &&
                      "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100",
                    sameDayAsSelected &&
                      "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100",
                    !sameDayAsSelected &&
                      !sameDayAsToday &&
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                    (sameDayAsSelected || sameDayAsToday) && "font-semibold",
                    hasEvents &&
                      !sameDayAsSelected &&
                      !sameDayAsToday &&
                      "ring-1 ring-inset ring-emerald-500",
                  )}
                >
                  <time dateTime={format(day, "yyyy-MM-dd")}>
                    {format(day, "d")}
                  </time>
                  {hasEvents && (
                    <div className="w-1.5 h-1.5 mx-auto mt-1 rounded-full bg-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4">
          Events for {format(selectedDay, "MMMM d, yyyy")}
        </h2>

        {filteredEvents.length === 0 ? (
          <p className="text-muted-foreground">
            No events scheduled for this day.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const course = getCourseById(event.courseId);

              return (
                <Card key={event.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <div className="text-sm text-muted-foreground">
                            {course.code}: {course.name}
                          </div>
                          <div className="text-sm">
                            {getFormattedEventTime(event)}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={getEventBadgeColor(event.type)}
                      >
                        {event.type.charAt(0).toUpperCase() +
                          event.type.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to handle class combination
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
