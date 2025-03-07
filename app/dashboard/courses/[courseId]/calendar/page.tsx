import React from "react";
import { CalendarComponent } from "@/components/calendar-component";

interface CalendarPageProps {
  params: {
    courseId: string;
  };
}

export default function CalendarPage({ params }: CalendarPageProps) {
  // Access the params directly
  const courseId = params.courseId;
  return <CalendarComponent courseId={courseId} />;
}
