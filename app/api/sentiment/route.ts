// app/api/sentiment/route.ts
import { NextRequest, NextResponse } from "next/server";

// URL to your FastAPI sentiment analysis service
const SENTIMENT_API_URL =
  process.env.SENTIMENT_API_URL || "http://localhost:8000/analyze";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { text } = data;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Make a request to the FastAPI sentiment analysis service
    const response = await fetch(SENTIMENT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      // If the FastAPI server returns an error, forward it
      const errorData = await response.json();
      console.error("Sentiment API error:", errorData);

      return NextResponse.json(
        { error: errorData.detail || "Error analyzing sentiment" },
        { status: response.status },
      );
    }

    // Get the sentiment analysis result
    const sentimentData = await response.json();

    return NextResponse.json({
      sentiment: sentimentData.sentiment,
      confidence: sentimentData.confidence,
      detailedScores: sentimentData.detailed_scores,
    });
  } catch (error) {
    console.error("Error calling sentiment analysis service:", error);
    return NextResponse.json(
      { error: "Failed to analyze sentiment" },
      { status: 500 },
    );
  }
}
