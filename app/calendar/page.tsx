"use client";

import React, { useState, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CustomCreateEventDialog from "@/components/custom-create-event-dialog";

// Type definitions
interface Course {
  id: string;
  name: string;
  code: string;
  owner_id: string;
}

interface CalendarEvent {
  id: string;
  title?: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  date: string;
  endTime: string;
  type: string;
  status: string;
  entry_code: string;
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

export default function CalendarPage() {
  const today = startOfToday();
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(format(today, "MMM-yyyy"));
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const firstDayCurrentMonth = parse(currentMonth, "MMM-yyyy", new Date());
  const days = eachDayOfInterval({
    start: firstDayCurrentMonth,
    end: endOfMonth(firstDayCurrentMonth),
  });

  // Fetch courses and events data
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Fetch courses
        const { data: coursesData, error: coursesError } = await supabase
          .from("courses")
          .select("id, name, code")
          .eq("owner_id", user.id);

        if (coursesError) {
          console.error("Error fetching courses:", coursesError);
          setError("Failed to load courses. Please try again.");
          return;
        }

        setCourses(
          coursesData?.map((course) => ({ ...course, owner_id: user.id })) ||
            [],
        );

        // Get course IDs
        const courseIds = coursesData?.map((course) => course.id) || [];

        if (courseIds.length === 0) {
          setIsLoading(false);
          setEvents([]);
          return;
        }

        // Fetch events for these courses
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("*, courses(name, code)")
          .in("course_id", courseIds);

        if (eventsError) {
          console.error("Error fetching events:", eventsError);
          setError("Failed to load events. Please try again.");
          return;
        }

        // Format events data
        const formattedEvents: CalendarEvent[] = (eventsData || []).map(
          (event) => {
            // Determine event type based on status or other factors
            const eventType = determineEventType(event);

            return {
              id: event.id,
              title: `${event.courses?.code} ${determineEventTitle(event)}`,
              courseId: event.course_id,
              courseName: event.courses?.name || "Unknown Course",
              courseCode: event.courses?.code || "Unknown",
              date: event.event_date,
              endTime: calculateEndTime(event.event_date), // Calculate end time if not stored
              type: eventType,
              status: event.status,
              entry_code: event.entry_code || "",
            };
          },
        );

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("An unexpected error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Helper function to determine event type (this would ideally be a field in your database)
  const determineEventType = (event: { event_date: string }): string => {
    // This is just an example. In a real app, you would have a more sophisticated logic
    // or store the type in the database
    const date = new Date(event.event_date);
    const hour = date.getHours();

    // Simple logic based on time of day
    if (hour < 10) return "lecture";
    if (hour < 13) return "lab";
    if (hour < 16) return "office-hours";
    return "deadline";
  };

  // Helper function to determine event title
  // Helper function to determine event title
  const determineEventTitle = (event: { status?: string }): string => {
    // This is just an example. In a real app, you would likely have an event_title field
    const status = event.status;

    if (status === "open") return "Feedback Session";
    if (status === "closed") return "Closed Session";
    return "Event";
  };

  // Helper function to calculate end time (if not stored in database)
  const calculateEndTime = (startTime: string): string => {
    // Default to 1 hour after start time
    const start = new Date(startTime);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);
    return end.toISOString();
  };

  function previousMonth() {
    const firstDayPreviousMonth = add(firstDayCurrentMonth, { months: -1 });
    setCurrentMonth(format(firstDayPreviousMonth, "MMM-yyyy"));
  }

  function nextMonth() {
    const firstDayNextMonth = add(firstDayCurrentMonth, { months: 1 });
    setCurrentMonth(format(firstDayNextMonth, "MMM-yyyy"));
  }

  // Event creation callback
  const handleEventCreated = (eventId: string) => {
    // Refresh events to include the newly created one
    const fetchEvents = async () => {
      if (!user) return;

      try {
        const supabase = createClient();
        const courseIds = courses.map((course) => course.id);

        const { data: eventsData, error } = await supabase
          .from("events")
          .select("*, courses(name, code)")
          .in("course_id", courseIds);

        if (error) {
          console.error("Error refreshing events:", error);
          return;
        }

        // Format events
        const formattedEvents: CalendarEvent[] = (eventsData || []).map(
          (event) => {
            const eventType = determineEventType(event);

            return {
              id: event.id,
              title: `${event.courses?.code} ${determineEventTitle(event)}`,
              courseId: event.course_id,
              courseName: event.courses?.name || "Unknown Course",
              courseCode: event.courses?.code || "Unknown",
              date: event.event_date,
              endTime: calculateEndTime(event.event_date),
              type: eventType,
              status: event.status,
              entry_code: event.entry_code || "",
            };
          },
        );

        setEvents(formattedEvents);

        // Set selected day to the day of the new event
        const newEvent = formattedEvents.find((e) => e.id === eventId);
        if (newEvent) {
          setSelectedDay(parseISO(newEvent.date));
        }
      } catch (error) {
        console.error("Error refreshing events:", error);
      }
    };

    fetchEvents();
  };

  // Filter events based on selected course and day
  const filteredEvents = events.filter((event) => {
    const eventDate = parseISO(event.date);
    const sameDay = isSameDay(eventDate, selectedDay);
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
          {/* Create event dialog */}
          {courses.length > 0 && (
            <CustomCreateEventDialog onEventCreated={handleEventCreated}>
              <Button className="gap-2">Add Event</Button>
            </CustomCreateEventDialog>
          )}
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

      {isLoading ? (
        <div className="flex items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          <span className="ml-2">Loading calendar...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            <p>{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
                        (sameDayAsSelected || sameDayAsToday) &&
                          "font-semibold",
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
                {filteredEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-emerald-600" />
                          <div>
                            <h3 className="font-semibold">{event.title}</h3>
                            <div className="text-sm text-muted-foreground">
                              {event.courseCode}: {event.courseName}
                            </div>
                            <div className="text-sm">
                              {getFormattedEventTime(event)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {event.status === "open" ? "Active" : "Closed"} •
                              Code: {event.entry_code}
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
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Helper function to handle class combination
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
