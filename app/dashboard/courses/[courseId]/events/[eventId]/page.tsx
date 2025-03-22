"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ThumbsUp,
  ThumbsDown,
  Minus,
  Filter,
  FilterX,
  MessageSquare,
  Loader2,
  AlertTriangle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Type definitions
interface Event {
  id: string;
  course_id: string;
  event_date: string;
  status: "open" | "closed" | "archived";
  entry_code: string;
  created_at: string;
  updated_at: string;
  positive_feedback_count: number;
  negative_feedback_count: number;
  neutral_feedback_count: number;
  total_feedback_count: number;
  courses?: {
    name: string;
    code: string;
  };
}

interface Feedback {
  id: string;
  event_id: string;
  content: string;
  tone: "positive" | "negative" | "neutral";
  is_reviewed: boolean;
  created_at: string;
}

interface EventAnalytics {
  positivePercentage: number;
  negativePercentage: number;
  neutralPercentage: number;
  positiveFeedback: number;
  negativeFeedback: number;
  neutralFeedback: number;
  totalFeedback: number;
  commonWords: { text: string; value: number }[];
}

interface EventAnalyticsPageProps {
  params:
    | { courseId: string; eventId: string }
    | Promise<{ courseId: string; eventId: string }>;
}

const use =
  React.use ||
  (<T,>(promise: T | Promise<T>): T =>
    promise instanceof Promise ? (promise as unknown as T) : promise);

export default function EventAnalyticsPage({
  params,
}: EventAnalyticsPageProps) {
  // Unwrap params using React.use if it's a Promise
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.courseId;
  const eventId = unwrappedParams.eventId;

  // State for event and course data
  const [event, setEvent] = useState<Event | null>(null);
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for feedback
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [analytics, setAnalytics] = useState<EventAnalytics>({
    positivePercentage: 0,
    negativePercentage: 0,
    neutralPercentage: 0,
    positiveFeedback: 0,
    negativeFeedback: 0,
    neutralFeedback: 0,
    totalFeedback: 0,
    commonWords: [],
  });

  // State for filtering feedback
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Fetch data on component mount
  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*, courses(name, code)")
          .eq("id", eventId)
          .single();

        if (eventError) {
          console.error("Error fetching event:", eventError);
          setError("Failed to load event data");
          return;
        }

        if (!eventData) {
          setError("Event not found");
          return;
        }

        setEvent(eventData);
        if (eventData.courses) {
          setCourseName(eventData.courses.name);
          setCourseCode(eventData.courses.code);
        }

        // Fetch feedback for this event
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false });

        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError);
          setError("Failed to load feedback data");
          return;
        }

        setFeedback(feedbackData || []);

        // Calculate analytics
        if (feedbackData) {
          const positiveFeedback = feedbackData.filter(
            (f) => f.tone === "positive",
          ).length;
          const negativeFeedback = feedbackData.filter(
            (f) => f.tone === "negative",
          ).length;
          const neutralFeedback = feedbackData.filter(
            (f) => f.tone === "neutral",
          ).length;
          const totalFeedback = feedbackData.length;

          // Extract and count words from feedback
          const wordCounts: Record<string, number> = {};
          const stopWords = new Set([
            "i",
            "me",
            "my",
            "myself",
            "we",
            "our",
            "ours",
            "ourselves",
            "you",
            "your",
            "yours",
            "yourself",
            "yourselves",
            "he",
            "him",
            "his",
            "himself",
            "she",
            "her",
            "hers",
            "herself",
            "it",
            "its",
            "itself",
            "they",
            "them",
            "their",
            "theirs",
            "themselves",
            "what",
            "which",
            "who",
            "whom",
            "this",
            "that",
            "these",
            "those",
            "am",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "being",
            "have",
            "has",
            "had",
            "having",
            "do",
            "does",
            "did",
            "doing",
            "a",
            "an",
            "the",
            "and",
            "but",
            "if",
            "or",
            "because",
            "as",
            "until",
            "while",
            "of",
            "at",
            "by",
            "for",
            "with",
            "about",
            "against",
            "between",
            "into",
            "through",
            "during",
            "before",
            "after",
            "above",
            "below",
            "to",
            "from",
            "up",
            "down",
            "in",
            "out",
            "on",
            "off",
            "over",
            "under",
            "again",
            "further",
            "then",
            "once",
            "here",
            "there",
            "when",
            "where",
            "why",
            "how",
            "all",
            "any",
            "both",
            "each",
            "few",
            "more",
            "most",
            "other",
            "some",
            "such",
            "no",
            "nor",
            "not",
            "only",
            "own",
            "same",
            "so",
            "than",
            "too",
            "very",
            "s",
            "t",
            "can",
            "will",
            "just",
            "don",
            "should",
            "now",
          ]);

          feedbackData.forEach((item) => {
            const words = item.content.toLowerCase().split(/\W+/);
            words.forEach((word: string) => {
              if (word && !stopWords.has(word) && word.length > 2) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
              }
            });
          });

          // Sort words by frequency
          const sortedWords = Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([text, value]) => ({ text, value }));

          setAnalytics({
            positivePercentage: totalFeedback
              ? (positiveFeedback / totalFeedback) * 100
              : 0,
            negativePercentage: totalFeedback
              ? (negativeFeedback / totalFeedback) * 100
              : 0,
            neutralPercentage: totalFeedback
              ? (neutralFeedback / totalFeedback) * 100
              : 0,
            positiveFeedback,
            negativeFeedback,
            neutralFeedback,
            totalFeedback,
            commonWords: sortedWords,
          });
        }
      } catch (err) {
        console.error("Error fetching event data:", err);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [courseId, eventId]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Format relative time for feedback
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get sentiment icon based on sentiment
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="h-4 w-4 text-emerald-600" />;
      case "negative":
        return <ThumbsDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Filter and sort feedback
  const filteredFeedback = feedback
    .filter((item) => {
      // Search filter
      if (
        searchQuery &&
        !item.content.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Sentiment filter
      if (sentimentFilter !== "all" && item.tone !== sentimentFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by date
      if (sortOrder === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else {
        return (
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      }
    });

  // Prepare data for charts
  const sentimentChartData = [
    { name: "Positive", value: analytics.positiveFeedback, color: "#10b981" },
    { name: "Neutral", value: analytics.neutralFeedback, color: "#6b7280" },
    { name: "Negative", value: analytics.negativeFeedback, color: "#ef4444" },
  ].filter((item) => item.value > 0);

  // Get top words for word cloud
  const topWords = analytics.commonWords;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Event Analytics</h1>
        </div>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <span className="ml-2 text-lg">Loading event data...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Event Analytics</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Event</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/dashboard/courses/${courseId}`}
            className="text-sm text-muted-foreground mb-2 hover:text-foreground flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to {courseCode || "Course"}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Event Analytics</h1>
          <p className="text-muted-foreground">
            {courseName} • {event ? formatDate(event.event_date) : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link
              href={`/dashboard/courses/${courseId}/share?event=${eventId}`}
            >
              Share Feedback Code
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Responses</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold">
              {analytics.totalFeedback || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Students provided feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Positive Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-emerald-600">
              {analytics.totalFeedback
                ? Math.round(analytics.positivePercentage)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.positiveFeedback || 0} positive responses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Negative Sentiment</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-red-600">
              {analytics.totalFeedback
                ? Math.round(analytics.negativePercentage)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.negativeFeedback || 0} negative responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sentiment Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Breakdown of feedback sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {sentimentChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {sentimentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No sentiment data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Common Words/Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Terms</CardTitle>
            <CardDescription>
              Frequently mentioned words in feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {topWords.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={topWords}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 50,
                      bottom: 5,
                    }}
                  >
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="text" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No common terms data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Section */}
      <Card>
        <CardHeader>
          <CardTitle>Student Feedback</CardTitle>
          <CardDescription>
            All feedback received for this event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Input
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex gap-2">
              <Select
                value={sentimentFilter}
                onValueChange={setSentimentFilter}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sentiment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setSearchQuery("");
                  setSentimentFilter("all");
                  setSortOrder("newest");
                }}
              >
                <FilterX className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Feedback List */}
          {filteredFeedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No feedback found</h3>
              <p className="text-sm text-muted-foreground">
                {feedback.length > 0
                  ? "Try adjusting your filters to find what you're looking for."
                  : "No feedback has been submitted for this event yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Badge
                        variant="outline"
                        className={
                          item.tone === "positive"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : item.tone === "negative"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }
                      >
                        <span className="flex items-center gap-1">
                          {getSentimentIcon(item.tone)}
                          {item.tone.charAt(0).toUpperCase() +
                            item.tone.slice(1)}
                        </span>
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatRelativeTime(item.created_at)}</span>
                      </div>
                    </div>
                    <p className="mb-3">{item.content}</p>
                    <div className="flex justify-end">
                      <Badge
                        variant="outline"
                        className={item.is_reviewed ? "bg-emerald-50" : ""}
                      >
                        {item.is_reviewed ? "Reviewed" : "Not reviewed"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredFeedback.length} of {feedback.length} responses
          </div>
          <Button variant="outline" disabled={feedback.length === 0}>
            Download All Feedback
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
