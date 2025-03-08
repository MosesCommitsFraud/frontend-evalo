"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Book, MessageSquare } from "lucide-react";

// This main analytics page serves as an entry point to the analytics section
// It redirects to the overview page by default
export default function AnalyticsPage() {
  const router = useRouter();

  // Redirect to overview page on component mount
  useEffect(() => {
    router.push("/analytics/overview");
  }, [router]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    if (value === "overview") {
      router.push("/analytics/overview");
    } else if (value === "courses") {
      router.push("/analytics/courses");
    } else if (value === "feedback") {
      router.push("/analytics/feedback");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
      </div>

      {/* Analytics Tabs - These are visible during the redirect */}
      <Tabs
        defaultValue="overview"
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <Book className="h-4 w-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
        </TabsList>

        {/* Loading indicator */}
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </Tabs>
    </div>
  );
}
