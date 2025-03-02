import { CalendarComponent } from "@/components/calendar-component";

interface CalendarPageProps {
  params: {
    courseId: string;
  };
}

export default function CalendarPage({ params }: CalendarPageProps) {
  return <CalendarComponent courseId={params.courseId} />;
}
