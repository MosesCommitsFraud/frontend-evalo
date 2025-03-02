import { FeedbackAnalytics } from "@/components/feedback-analytics";

interface AnalyticsPageProps {
  params: {
    courseId: string;
  };
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  return <FeedbackAnalytics courseId={params.courseId} />;
}
