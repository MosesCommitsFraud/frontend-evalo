"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// If you have a prebuilt Textarea component from Shadcn/ui, import it;
// otherwise you can use a native textarea styled with Tailwind.
import { Textarea } from "@/components/ui/textarea";

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate input.
    if (!feedback.trim()) {
      setError("Feedback cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      // Replace this with your actual API call, for example:
      // await fetch("/api/feedback", { method: "POST", body: JSON.stringify({ feedback }) });
      console.log("Submitted feedback:", feedback);
      setSuccess(true);
      setFeedback("");
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">We Value Your Feedback</h1>
      {success && (
        <div className="bg-green-100 text-green-700 p-4 rounded mb-4">
          Thank you for your feedback!
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="feedback">Your Feedback</Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here..."
            className="mt-1 w-full"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </div>
  );
}
