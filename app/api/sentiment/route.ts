import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { text } = data;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    console.log("Analyzing text:", text);

    // Call FastAPI endpoint
    const response = await fetch(
      `${process.env.HUGGING_FACE_API_URL}/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          show_details: true,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(
        `Error from API: ${response.status}, ${response.statusText}`,
      );
      console.error("Error details:", errorText);

      return NextResponse.json(
        {
          error: `Sentiment analysis failed: ${response.statusText || response.status}`,
        },
        { status: 500 },
      );
    }

    // Parse the response
    const result = await response.json();
    console.log("Sentiment analysis result:", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    return NextResponse.json(
      {
        error: `Failed to analyze sentiment: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
