import { NextRequest, NextResponse } from "next/server";

// CORS headers to use in all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  Allow: "POST, OPTIONS",
};

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Log the request method and URL for debugging
    console.log(`Processing ${request.method} request to ${request.url}`);

    // Parse the request body
    const data = await request.json();
    const { text } = data;

    if (!text) {
      return NextResponse.json(
        { error: "No text provided" },
        { status: 400, headers: corsHeaders },
      );
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
        { status: 500, headers: corsHeaders },
      );
    }

    // Parse the response
    const result = await response.json();
    console.log("Sentiment analysis result:", result);

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error("Error in sentiment analysis:", error);
    return NextResponse.json(
      {
        error: `Failed to analyze sentiment: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
