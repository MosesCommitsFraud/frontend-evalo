"use client";

import { useState, memo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, MessageSquare, Search } from "lucide-react";

// Mock feedback data
const feedbackData = [
  {
    id: "1",
    content:
      "The lecture was very informative and the examples were extremely helpful for understanding the concepts.",
    sentiment: "positive",
    category: "lecture",
    date: "2025-03-01",
    keywords: ["lecture", "examples", "understanding"],
  },
  {
    id: "2",
    content:
      "I'm struggling with the assignments, they seem much harder than what we covered in class.",
    sentiment: "negative",
    category: "assignment",
    date: "2025-02-28",
    keywords: ["assignments", "difficult", "class"],
  },
  {
    id: "3",
    content:
      "The pace of the lectures is good, but I think we need more practice problems.",
    sentiment: "neutral",
    category: "suggestion",
    date: "2025-02-27",
    keywords: ["pace", "practice", "lectures"],
  },
  {
    id: "4",
    content:
      "The group project instructions were unclear. Could you provide more details about the requirements?",
    sentiment: "negative",
    category: "project",
    date: "2025-02-25",
    keywords: ["project", "instructions", "requirements"],
  },
  {
    id: "5",
    content:
      "I really appreciate the additional resources you shared after class. They've been very helpful for my understanding.",
    sentiment: "positive",
    category: "resources",
    date: "2025-02-24",
    keywords: ["resources", "helpful", "understanding"],
  },
];

// Memoized FeedbackCard component to prevent unnecessary re-renders
const FeedbackCard = memo(({ feedback }: { feedback: any }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant={
                feedback.sentiment === "positive"
                  ? "default"
                  : feedback.sentiment === "negative"
                    ? "destructive"
                    : "secondary"
              }
            >
              {feedback.sentiment.charAt(0).toUpperCase() +
                feedback.sentiment.slice(1)}
            </Badge>
            <Badge variant="outline">{feedback.category}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(feedback.date).toLocaleDateString()}
          </span>
        </div>
        <p className="mb-3">{feedback.content}</p>
        <div className="flex flex-wrap gap-1">
          {feedback.keywords.map((keyword: string) => (
            <Badge key={keyword} variant="outline" className="bg-emerald-50">
              {keyword}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
FeedbackCard.displayName = "FeedbackCard";

// Empty state component for no results
const EmptyState = memo(() => (
  <div className="flex h-32 items-center justify-center rounded-md border text-center">
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <MessageSquare className="h-8 w-8" />
      <p>No feedback matches your filters</p>
    </div>
  </div>
));
EmptyState.displayName = "EmptyState";

// Main FeedbackList component
export function FeedbackList({ courseId }: { courseId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Memoized filter handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleSentimentFilterChange = useCallback((value: string) => {
    setSentimentFilter(value);
  }, []);

  const handleCategoryFilterChange = useCallback((value: string) => {
    setCategoryFilter(value);
  }, []);

  // Filter feedback based on current filters
  const filteredFeedback = feedbackData.filter((feedback) => {
    // Search filter
    if (
      searchQuery &&
      !feedback.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Sentiment filter
    if (sentimentFilter !== "all" && feedback.sentiment !== sentimentFilter) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "all" && feedback.category !== categoryFilter) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={sentimentFilter}
            onValueChange={handleSentimentFilterChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="positive">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="negative">Negative</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter}
            onValueChange={handleCategoryFilterChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="lecture">Lecture</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="suggestion">Suggestion</SelectItem>
              <SelectItem value="resources">Resources</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-4">
        {filteredFeedback.length === 0 ? (
          <EmptyState />
        ) : (
          filteredFeedback.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))
        )}
      </div>
    </div>
  );
}
