import React from "react";
import { FeedbackAnalytics } from "@/components/feedback-analytics";

interface AnalyticsPageProps {
  params: {
    courseId: string;
  };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  // Access the params directly
  const courseId = params.courseId;
  return <FeedbackAnalytics courseId={courseId} />;
}
