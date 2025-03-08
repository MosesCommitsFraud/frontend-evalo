"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomTabs from "@/components/custom-tabs";
import { BarChart3, Book, MessageSquare } from "lucide-react";

// This main analytics page serves as an entry point to the analytics section
// It redirects to the overview page by default
export default function AdminAnalyticsPage() {
  const router = useRouter();

  // Redirect to overview page on component mount
  useEffect(() => {
    router.push("/admin-analytics/overview");
  }, [router]);

  // Create tabs data for CustomTabs component
  const tabsData = [
    {
      label: (
        <span className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Overview
        </span>
      ),
      content: (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ),
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <Book className="h-4 w-4" />
          Courses
        </span>
      ),
      content: <div></div>,
    },
    {
      label: (
        <span className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Feedback
        </span>
      ),
      content: <div></div>,
    },
  ];

  // Handle tab selection
  const handleTabChange = (index: number) => {
    if (index === 0) router.push("/admin-analytics/overview");
    else if (index === 1) router.push("/admin-analytics/courses");
    else if (index === 2) router.push("/admin-analytics/feedback");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
      </div>

      {/* Use CustomTabs component with loading indicator in the first tab */}
      <CustomTabs
        tabs={tabsData}
        defaultActiveIndex={0}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
