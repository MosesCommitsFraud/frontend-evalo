"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomTabs from "@/components/custom-tabs";
import { Activity, CalendarIcon, Clock, BarChart, Users } from "lucide-react";

export default function DashboardPage() {
  // Build tab for Upcoming Events
  const upcomingTab = {
    label: "Upcoming Events",
    content: (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Your scheduled events for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <CalendarIcon className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {event.course}
                  </p>
                </div>
                <div className="ml-auto flex items-center">
                  <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
  };

  // Build tab for Recent Feedback
  const feedbackTab = {
    label: "Recent Feedback",
    content: (
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>
            Latest student feedback across all courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFeedback.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center">
                  <span
                    className={`mr-2 h-2 w-2 rounded-full ${
                      item.sentiment === "positive"
                        ? "bg-emerald-500"
                        : item.sentiment === "negative"
                          ? "bg-red-500"
                          : "bg-gray-500"
                    }`}
                  />
                  <p className="text-sm font-medium">{item.course}</p>
                  <p className="ml-auto text-xs text-muted-foreground">
                    {item.time}
                  </p>
                </div>
                <p className="text-sm">{item.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    ),
  };

  // Combine tab data into an array
  const tabsData = [upcomingTab, feedbackTab];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookIcon className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Active courses this semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">243</div>
            <p className="text-xs text-muted-foreground">
              +15% from last semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Activity className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Sentiment
            </CardTitle>
            <BarChart className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">83%</div>
            <p className="text-xs text-muted-foreground">+4% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Use the custom tabs component */}
      <CustomTabs tabs={tabsData} />
    </div>
  );
}

// BookIcon component used in the dashboard cards
const BookIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

// Mock data for upcoming events and recent feedback
const upcomingEvents = [
  {
    id: 1,
    title: "CS101 Lecture",
    course: "Introduction to Programming",
    time: "Today, 10:00 AM",
  },
  {
    id: 2,
    title: "Office Hours",
    course: "Data Structures & Algorithms",
    time: "Today, 2:00 PM",
  },
  {
    id: 3,
    title: "Project Deadline",
    course: "Web Development",
    time: "Tomorrow, 11:59 PM",
  },
  {
    id: 4,
    title: "Midterm Exam",
    course: "Machine Learning Basics",
    time: "Friday, 9:00 AM",
  },
];

const recentFeedback = [
  {
    id: 1,
    course: "Introduction to Programming",
    content:
      "The examples in today's lecture were very helpful for understanding the concept.",
    sentiment: "positive",
    time: "2 hours ago",
  },
  {
    id: 2,
    course: "Data Structures & Algorithms",
    content:
      "I'm struggling to understand the time complexity analysis we covered today.",
    sentiment: "negative",
    time: "5 hours ago",
  },
  {
    id: 3,
    course: "Web Development",
    content:
      "The group project is going well, but we could use more guidance on the requirements.",
    sentiment: "neutral",
    time: "Yesterday",
  },
];
