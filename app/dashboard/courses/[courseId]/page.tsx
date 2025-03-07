import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, CalendarDays, MessageSquare, Settings } from "lucide-react";
import { FeedbackAnalytics } from "@/components/feedback-analytics";

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  // Access the params directly since we're not using Server Components features that require unwrapping
  const courseId = params.courseId;
  const courseName = getCourseNameById(courseId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{courseName}</h1>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Course Settings
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Responses"
              value="124"
              description="+6 this week"
              icon={MessageSquare}
            />
            <StatsCard
              title="Sentiment Score"
              value="78%"
              description="+2% from last week"
              icon={BarChart3}
            />
            <StatsCard
              title="Response Rate"
              value="65%"
              description="Of enrolled students"
              icon={BarChart3}
            />
            <StatsCard
              title="Total Students"
              value="42"
              description="Currently enrolled"
              icon={BarChart3}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Categories</CardTitle>
                <CardDescription>
                  Distribution of feedback by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {/* Placeholder for chart */}
                <div className="flex h-full items-center justify-center rounded-md border border-dashed p-8 text-muted-foreground">
                  Category distribution chart
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
                <CardDescription>At a glance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quickStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center justify-between"
                    >
                      <div className="text-sm">{stat.label}</div>
                      <div className="font-medium">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<div>Loading analytics...</div>}>
            <FeedbackAnalytics courseId={courseId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Student Feedback</CardTitle>
              <CardDescription>
                View and analyze all feedback received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Feedback filters would go here */}
                <div className="rounded-md border p-6 text-center text-muted-foreground">
                  Feedback list would go here
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Course Calendar</CardTitle>
              <CardDescription>
                Manage lectures, deadlines and office hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] rounded-md border p-6 text-center text-muted-foreground">
                Calendar view would go here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper components
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
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Mock data
const quickStats = [
  { label: "Most Active Time", value: "Tuesdays, 10-12 AM" },
  { label: "Top Keyword", value: "Assignments" },
  { label: "Avg. Response Length", value: "3.2 paragraphs" },
  { label: "Common Feature Request", value: "More practice problems" },
  { label: "Improvement Area", value: "Assignment clarity" },
];

// Helper function to get course name by ID
function getCourseNameById(id: string): string {
  const courses = {
    "course-1": "Introduction to Programming",
    "course-2": "Data Structures & Algorithms",
    "course-3": "Web Development",
    "course-4": "Machine Learning Basics",
    "course-5": "Database Systems",
  };

  return courses[id as keyof typeof courses] || "Unknown Course";
}
