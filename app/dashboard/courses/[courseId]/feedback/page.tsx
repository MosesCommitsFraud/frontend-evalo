import React from "react";
import { FeedbackList } from "@/components/feedback-list";

interface FeedbackPageProps {
  params: {
    courseId: string;
  };
}

export default function FeedbackPage({ params }: FeedbackPageProps) {
  // Access the params directly
  const courseId = params.courseId;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Feedback</h2>
      <FeedbackList courseId={courseId} />
    </div>
  );
}
