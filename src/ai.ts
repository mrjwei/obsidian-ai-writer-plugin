import { requestUrl } from "obsidian";
import type { LexicalResult } from "./types";

export async function runAI({
  text,
  action,
  apiKey
}: {
  text: string;
  action: "lexical" | "refine" | "rewrite";
  apiKey: string;
}): Promise<LexicalResult | { text: string; explanation?: string } | null> {
  const systemPrompt =
    action === "lexical"
      ? `
You are a professional English editor.

Task:
- Identify ALL lexical, grammatical, and usage issues.
- Provide a fully corrected version of the text.
- For each issue, return the EXACT problematic substring as it appears in the original text.

Rules:
- The "text" field MUST exactly match a substring of the original input.
- Include spelling, word choice, prepositions, collocations, and phrasing.

Return ONLY valid JSON:

{
  "fixedText": "string",
  "issues": [
    {
      "text": "string",
      "suggestion": "string",
      "message": "string"
    }
  ]
}
`
      : `
Rewrite the text.

Return the rewritten text first.
Then add:

Explanation:
- Briefly explain major changes.
`;

  const response = await requestUrl({
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0
    })
  });

  const raw: unknown = JSON.parse(response.text);
  const data = raw as { choices?: Array<{ message?: { content?: string } }> };
  const content: string | undefined = data.choices?.[0]?.message?.content;
  if (!content) return null;

  if (action === "lexical") {
    const parsed: unknown = JSON.parse(content);
    const maybe = parsed as Partial<LexicalResult>;
    if (
      typeof maybe === "object" &&
      maybe !== null &&
      typeof maybe.fixedText === "string" &&
      Array.isArray(maybe.issues)
    ) {
      return {
        fixedText: maybe.fixedText,
        issues: maybe.issues
      };
    }
    return null;
  }

  const [main, explanation] = content.split("\n\nExplanation:\n");
  return { text: main!.trim(), explanation: explanation?.trim() };
}
