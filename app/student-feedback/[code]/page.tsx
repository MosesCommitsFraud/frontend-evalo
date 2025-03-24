"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";

export default function StudentFeedbackPage() {
  const { code } = useParams() as { code?: string };
  const codeFromRoute = code || "";

  // Event and course information
  const [eventInfo, setEventInfo] = useState<{
    eventId: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    organizationId: string;
  } | null>(null);

  // State for the form and submission
  const [accessCode, setAccessCode] = useState(() => codeFromRoute);
  const [feedback, setFeedback] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Validate the code format (4 characters, letters and numbers)
  const validateCodeFormat = (code: string) => {
    const regex = /^[A-Z0-9]{4}$/;
    return regex.test(code.toUpperCase());
  };

  const checkCodeValidity = async (code: string) => {
    setIsCheckingCode(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, event_date, status, entry_code, course_id, organization_id",
        )
        .eq("entry_code", code.toUpperCase())
        .eq("status", "open")
        .single();

      if (error) {
        console.error("Error checking code:", error);
        setIsCodeValid(false);
        setError("Invalid access code. Please check and try again.");
        return false;
      }

      if (data) {
        const { data: courseData } = await supabase
          .from("courses")
          .select("name, code")
          .eq("id", data.course_id)
          .single();

        setEventInfo({
          eventId: data.id,
          courseId: data.course_id,
          courseName: courseData?.name || "Unknown Course",
          courseCode: courseData?.code || "Unknown",
          organizationId: data.organization_id,
        });
        setIsCodeValid(true);
        return true;
      } else {
        setIsCodeValid(false);
        setError("Invalid or expired access code.");
        return false;
      }
    } catch (err) {
      console.error("Error validating code:", err);
      setIsCodeValid(false);
      setError("Unable to verify the access code. Please try again later.");
      return false;
    } finally {
      setIsCheckingCode(false);
    }
  };

  // Auto-validate the code if it's in the URL
  useEffect(() => {
    if (codeFromRoute) {
      const isValidFormat = validateCodeFormat(codeFromRoute);

      if (isValidFormat) {
        checkCodeValidity(codeFromRoute);
      } else {
        setIsCodeValid(false);
        setError(
          "Invalid access code format. Please enter a valid 4-character code.",
        );
      }
    }
  }, [codeFromRoute]);

  // Handle code input changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase().slice(0, 4);
    setAccessCode(code);
    setError("");

    // Reset validation when code changes
    setIsCodeValid(false);

    // Auto-validate when code is 4 characters
    if (code.length === 4) {
      if (validateCodeFormat(code)) {
        checkCodeValidity(code);
      } else {
        setError("Invalid code format. Please check the code and try again.");
      }
    }
  };

  // Validate code manually
  const handleValidateCode = () => {
    if (validateCodeFormat(accessCode)) {
      checkCodeValidity(accessCode);
    } else {
      setError("Invalid code format. Please enter a valid 4-character code.");
    }
  };

  // Handle share submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCodeValid || !eventInfo) {
      setError("Please enter a valid access code.");
      return;
    }

    if (!feedback.trim()) {
      setError("Please enter your feedback.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const supabase = createClient();

      // Call sentiment analysis API
      let sentiment: "positive" | "negative" | "neutral";
      const apiError = false;
      try {
        // Use absolute URL to ensure proper routing on mobile
        const apiUrl = `${window.location.origin}/api/sentiment`;

        // Add more verbose console logging for debugging
        console.log(
          "Calling sentiment API at:",
          apiUrl,
          "with text:",
          feedback.substring(0, 20) + "...",
        );

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: feedback }),
          // Make sure the credentials mode is appropriate
          credentials: "same-origin",
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Sentiment API error:", {
            status: response.status,
            statusText: response.statusText,
            errorText,
          });
          setError(
            `Sentiment analysis failed: ${response.status} ${response.statusText}`,
          );
          setIsSubmitting(false);
          return;
        }

        const result = await response.json();
        sentiment = result.sentiment;
        console.log("Sentiment result:", sentiment);
      } catch (error) {
        console.error("Error calling sentiment API:", error);
        setError("Unable to analyze feedback sentiment. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // If sentiment analysis failed, stop the submission process
      if (apiError) {
        setIsSubmitting(false);
        return;
      }

      // Create the feedback record with the sentiment from the API
      const { error: insertError } = await supabase.from("feedback").insert({
        event_id: eventInfo.eventId,
        content: feedback,
        tone: sentiment,
        is_reviewed: false,
        created_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error("Error submitting feedback:", insertError);
        setError(
          `Failed to submit feedback: ${insertError.message}. Please try again.`,
        );
        return;
      }

      // Update the event's feedback counts
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(
          "positive_feedback_count, negative_feedback_count, neutral_feedback_count, total_feedback_count",
        )
        .eq("id", eventInfo.eventId)
        .single();

      if (eventError) {
        console.error("Error fetching event data:", eventError);
      } else if (eventData) {
        // Prepare the updated counts
        const updates: Record<string, unknown> = {
          total_feedback_count: (eventData.total_feedback_count || 0) + 1,
          updated_at: new Date().toISOString(),
        };

        if (sentiment === "positive") {
          updates.positive_feedback_count =
            (eventData.positive_feedback_count || 0) + 1;
        } else if (sentiment === "negative") {
          updates.negative_feedback_count =
            (eventData.negative_feedback_count || 0) + 1;
        } else {
          updates.neutral_feedback_count =
            (eventData.neutral_feedback_count || 0) + 1;
        }

        // Update the event
        const { error: updateError } = await supabase
          .from("events")
          .update(updates)
          .eq("id", eventInfo.eventId);

        if (updateError) {
          console.error("Error updating event counts:", updateError);
        }
      }

      // Success!
      setIsSubmitted(true);

      // Clear form after submission
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <MessageSquare className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Student Feedback
          </h1>
          <p className="text-muted-foreground mt-1">
            Share your thoughts about the course
          </p>
        </div>

        {isSubmitted ? (
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
              <CardTitle className="text-center">Feedback Submitted</CardTitle>
              <CardDescription className="text-center">
                Thank you for sharing your feedback! Your insights are valuable
                to your instructor.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-2">
              <p>Your feedback has been submitted anonymously.</p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button
                onClick={() => {
                  setIsSubmitted(false);
                }}
              >
                Submit Another Response
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Course Feedback</CardTitle>
                <CardDescription>
                  {eventInfo
                    ? `Provide feedback for ${eventInfo.courseCode}: ${eventInfo.courseName}`
                    : "Please enter the 4-character code provided by your instructor"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Access Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      placeholder="Enter 4-character code"
                      value={accessCode}
                      onChange={handleCodeChange}
                      className="text-center text-lg tracking-widest"
                      maxLength={4}
                      required
                      autoFocus={!codeFromRoute}
                      disabled={isCodeValid || isCheckingCode}
                    />
                    {!isCodeValid && !codeFromRoute && (
                      <Button
                        type="button"
                        onClick={handleValidateCode}
                        disabled={accessCode.length !== 4 || isCheckingCode}
                      >
                        {isCheckingCode ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    )}
                  </div>

                  {isCheckingCode && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Verifying code...
                    </div>
                  )}

                  {isCodeValid && eventInfo && (
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Code verified for {eventInfo.courseCode}:{" "}
                      {eventInfo.courseName}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feedback">Your Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="What did you think about today's class? Any suggestions or questions?"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    required
                    disabled={!isCodeValid || isSubmitting}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isCodeValid || !feedback.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your feedback is anonymous and helps improve the quality of teaching.
        </p>
      </div>
    </div>
  );
}
