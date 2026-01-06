type LexicalIssue = {
  text: string;
  suggestion: string;
  message: string;
};

type LexicalResult = {
  fixedText: string;
  issues: LexicalIssue[];
};

export async function runAI({
  text,
  action,
  apiKey
}: {
  text: string;
  action: "lexical" | "refine" | "rewrite";
  apiKey: string;
}): Promise<any | null> {
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

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
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

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;

  if (action === "lexical") {
    return JSON.parse(content) as LexicalResult;
  }

  const [main, explanation] = content.split("\n\nExplanation:\n");
  return { text: main.trim(), explanation: explanation?.trim() };
}
