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
import { AlertTriangle, CheckCircle2, MessageSquare } from "lucide-react";

// Route: /student-feedback/[code]/page.tsx
interface StudentFeedbackPageProps {
  params: {
    code?: string;
  };
}

export default function StudentFeedbackPage({
  params,
}: StudentFeedbackPageProps) {
  // Store code in a variable immediately
  const codeFromRoute = params.code || "";

  // Then use codeFromRoute in your state initialization
  const [accessCode, setAccessCode] = useState(() => codeFromRoute);
  const [feedback, setFeedback] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Validate the code format (4 characters, letters and numbers)
  const validateCode = (code: string) => {
    const regex = /^[A-Z0-9]{4}$/;
    return regex.test(code.toUpperCase());
  };

  // Auto-validate the code if it's in the URL
  useEffect(() => {
    if (codeFromRoute) {
      const isValid = validateCode(codeFromRoute);
      setIsCodeValid(isValid);
      if (!isValid) {
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

    if (code.length === 4) {
      const isValid = validateCode(code);
      setIsCodeValid(isValid);
      setError(
        isValid
          ? ""
          : "Invalid access code format. Please check the code and try again.",
      );
    } else {
      setIsCodeValid(false);
      setError("");
    }
  };

  // Handle feedback submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCodeValid) {
      setError("Please enter a valid access code.");
      return;
    }

    if (!feedback.trim()) {
      setError("Please enter your feedback.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    // Simulate API call to submit feedback
    setTimeout(() => {
      // In a real app, this would be an API call
      console.log("Submitting feedback for code:", accessCode);
      console.log("Feedback content:", feedback);

      setIsSubmitting(false);
      setIsSubmitted(true);

      // Clear form after submission
      setFeedback("");
    }, 1500);
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
                  Please enter the 4-character code provided by your instructor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Access Code</Label>
                  <Input
                    id="code"
                    placeholder="Enter 4-character code"
                    value={accessCode}
                    onChange={handleCodeChange}
                    className="text-center text-lg tracking-widest"
                    maxLength={4}
                    required
                    autoFocus={!codeFromRoute}
                    disabled={!!codeFromRoute && isCodeValid}
                  />
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
                    disabled={!isCodeValid}
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
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
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
