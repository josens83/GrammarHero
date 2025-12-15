import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const anthropic = new Anthropic();

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from("profiles").select("subscription_tier").eq("id", user.id).single();

    if (profile?.subscription_tier === "free") {
      return NextResponse.json({ error: "Pro subscription required" }, { status: 403 });
    }

    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: `Analyze the following text for grammar errors. For each error found, provide:
1. The original text with the error
2. The corrected version
3. A brief explanation of the grammar rule
4. The type of error (e.g., "Subject-Verb Agreement", "Tense", "Article", etc.)

Also provide an overall grammar score from 0-100.

Respond in JSON format:
{
  "score": number,
  "issues": [
    {
      "original": "text with error",
      "correction": "corrected text",
      "explanation": "explanation of the rule",
      "type": "error type"
    }
  ]
}

Text to analyze:
${text}`
      }]
    });

    const content = response.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    const result = JSON.parse(content.text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Grammar check error:", error);
    return NextResponse.json({ error: "Failed to check grammar" }, { status: 500 });
  }
}
