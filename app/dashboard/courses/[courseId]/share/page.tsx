"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyIcon, RefreshCw, Check, Info } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

// This would typically be fetched from API based on the courseId
interface CourseShareProps {
  params: {
    courseId: string;
  };
}

export default function CourseSharePage({ params }: CourseShareProps) {
  // Use local state for the courseId instead of accessing params directly
  const [courseId] = useState(() => params.courseId);
  const [feedbackCode, setFeedbackCode] = useState("AB12");
  const [copied, setCopied] = useState(false);
  const [feedbackLink, setFeedbackLink] = useState("");
  const [isCodeResetDialogOpen, setIsCodeResetDialogOpen] = useState(false);

  // In a real application, this would be generated on the server or fetched from an API
  useEffect(() => {
    // Generate the feedback link based on the current domain and code
    setFeedbackLink(
      `${window.location.origin}/student-feedback/${feedbackCode}`,
    );
  }, [feedbackCode]);

  // Function to handle copying the feedback code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(feedbackCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Feedback code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to handle copying the feedback link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(feedbackLink);
    toast({
      title: "Copied!",
      description: "Feedback link copied to clipboard",
    });
  };

  // In a real application, this would make an API call to reset the code
  const handleCodeReset = () => {
    // Generate a new random code (4 characters: letters and numbers)
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let newCode = "";
    for (let i = 0; i < 4; i++) {
      newCode += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    setFeedbackCode(newCode);
    setIsCodeResetDialogOpen(false);

    toast({
      title: "Code Reset",
      description: "A new feedback code has been generated",
    });
  };

  // Get course information (mock data for now)
  const course = {
    id: courseId,
    name:
      courseId === "course-1"
        ? "Introduction to Programming"
        : courseId === "course-2"
          ? "Data Structures & Algorithms"
          : courseId === "course-3"
            ? "Web Development"
            : "Course " + courseId,
    code:
      courseId === "course-1"
        ? "CS101"
        : courseId === "course-2"
          ? "CS201"
          : courseId === "course-3"
            ? "CS301"
            : "CS" + courseId,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Share Feedback Code
        </h1>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setIsCodeResetDialogOpen(true)}
        >
          <RefreshCw className="h-4 w-4" />
          Reset Code
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {course.code}: {course.name}
          </CardTitle>
          <CardDescription>
            Share this code with your students to collect feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center gap-6 p-6 border rounded-xl border-dashed">
            <div className="h-64 w-64 bg-white border shadow-sm rounded-lg overflow-hidden flex items-center justify-center">
              {/* Normally we'd use a QR code library, but for this example we'll show a QR code image */}
              <svg
                viewBox="0 0 200 200"
                className="h-56 w-56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Simple QR code SVG for demonstration purposes */}
                <rect width="200" height="200" fill="white" />
                <rect x="50" y="50" width="15" height="15" fill="black" />
                <rect x="65" y="50" width="15" height="15" fill="black" />
                <rect x="80" y="50" width="15" height="15" fill="black" />
                <rect x="50" y="65" width="15" height="15" fill="black" />
                <rect x="80" y="65" width="15" height="15" fill="black" />
                <rect x="50" y="80" width="15" height="15" fill="black" />
                <rect x="65" y="80" width="15" height="15" fill="black" />
                <rect x="80" y="80" width="15" height="15" fill="black" />

                <rect x="135" y="50" width="15" height="15" fill="black" />
                <rect x="120" y="65" width="15" height="15" fill="black" />
                <rect x="135" y="65" width="15" height="15" fill="black" />
                <rect x="105" y="80" width="15" height="15" fill="black" />
                <rect x="120" y="80" width="15" height="15" fill="black" />

                <rect x="50" y="105" width="15" height="15" fill="black" />
                <rect x="65" y="105" width="15" height="15" fill="black" />
                <rect x="80" y="120" width="15" height="15" fill="black" />
                <rect x="50" y="135" width="15" height="15" fill="black" />
                <rect x="65" y="135" width="15" height="15" fill="black" />

                <rect x="105" y="105" width="15" height="15" fill="black" />
                <rect x="135" y="105" width="15" height="15" fill="black" />
                <rect x="120" y="120" width="15" height="15" fill="black" />
                <rect x="135" y="120" width="15" height="15" fill="black" />
                <rect x="105" y="135" width="15" height="15" fill="black" />
                <rect x="120" y="135" width="15" height="15" fill="black" />
                <rect x="135" y="135" width="15" height="15" fill="black" />
              </svg>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold tracking-wider">
                {feedbackCode}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Students need this code to submit feedback
              </p>
            </div>
          </div>

          <div className="w-full space-y-2">
            <Label htmlFor="feedback-url">Share Link</Label>
            <div className="flex gap-2">
              <Input
                id="feedback-url"
                value={feedbackLink}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="gap-2"
              >
                <CopyIcon className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          <div className="flex items-center p-4 border rounded-lg bg-muted/50 w-full">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              This code doesn't expire and will work for the entire course. You
              can reset it at any time, but this will invalidate any previously
              shared links or codes.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <Button
              variant="outline"
              onClick={handleCopyCode}
              className="gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <CopyIcon className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy Code"}
            </Button>
          </div>
          <Button onClick={() => window.print()}>Print QR Code</Button>
        </CardFooter>
      </Card>

      {/* Reset Code Dialog */}
      <Dialog
        open={isCodeResetDialogOpen}
        onOpenChange={setIsCodeResetDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Feedback Code</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset the feedback code? The current code
              ({feedbackCode}) will no longer work, and students will need the
              new code.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-destructive font-medium">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCodeResetDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCodeReset}>
              Reset Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
