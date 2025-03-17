"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  MessageSquare,
  Search,
  Filter,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Define the feedback interface
interface Feedback {
  id: string;
  content: string;
  sentiment: "positive" | "negative" | "neutral";
  date: string;
  keywords: string[];
}

interface FeedbackListProps {
  courseName: string;
  feedbackData: Feedback[];
}

export function FeedbackList({ courseName, feedbackData }: FeedbackListProps) {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");

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

    return true;
  });

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Feedback</CardTitle>
        <CardDescription>
          View and analyze all feedback received for {courseName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter Bar */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
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

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-md border text-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-8 w-8" />
                <p>No feedback matches your filters</p>
              </div>
            </div>
          ) : (
            filteredFeedback.map((feedback) => (
              <Card key={feedback.id}>
                <CardContent className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          feedback.sentiment === "positive"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : feedback.sentiment === "negative"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                        }
                      >
                        <span className="flex items-center gap-1">
                          {getSentimentIcon(feedback.sentiment)}
                          {feedback.sentiment.charAt(0).toUpperCase() +
                            feedback.sentiment.slice(1)}
                        </span>
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feedback.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mb-3">{feedback.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {feedback.keywords.map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="bg-blue-50 dark:bg-blue-900/10"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
