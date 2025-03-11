"use client";

import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { FeedbackAnalytics } from "@/components/feedback-analytics";
import { FeedbackList } from "@/components/feedback-list";

interface EventPageProps {
  params: {
    eventId: string;
  };
}

export default function EventPage({ params }: EventPageProps) {
  // Get eventId once and store it
  const eventId = params.eventId;
  const eventTitle = getEventTitleById(eventId);

  // Sample quick stats for the event dashboard
  const quickStats = [
    { label: "Attendees", value: "100" },
    { label: "Feedback Count", value: "35" },
    { label: "Overall Rating", value: "4.5/5" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header with event title and action buttons */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{eventTitle}</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            Change Status
          </Button>
          <Button variant="destructive" className="gap-2">
            Delete Event
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="gap-2">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            Feedback
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {quickStats.map((stat) => (
              <StatsCard
                key={stat.label}
                title={stat.label}
                value={stat.value}
                description=""
                icon={BarChart3}
              />
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Suspense fallback={<div>Loading analytics...</div>}>
            <FeedbackAnalytics courseId={eventId} />
          </Suspense>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          <FeedbackList courseId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper function to simulate event title retrieval
function getEventTitleById(eventId: string): string {
  const events = {
    "event-1": "Lecture on React",
    "event-2": "Assignment Deadline",
    "event-3": "Project Demo",
    "event-4": "Guest Lecture",
    "event-5": "Lab Session",
  };
  return events[eventId as keyof typeof events] || `Event ${eventId}`;
}

// Reusable StatsCard component
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
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
