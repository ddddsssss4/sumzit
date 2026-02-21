import { NextResponse } from 'next/server';

export const maxDuration = 120;

export async function POST(req: Request) {
    try {
        const { transcript } = await req.json();

        if (!transcript) {
            return NextResponse.json(
                { error: 'Transcript is required' },
                { status: 400 }
            );
        }

        const systemPrompt = `You are a helpful assistant that summarizes YouTube video transcripts.

You MUST produce EXACTLY two sections in your response:

## SECTION 1: Summary
Write a comprehensive, well-structured markdown summary of the video content.
- Use ## and ### headings to organize topics
- Use bullet points and **bold text** for key concepts
- Be thorough but concise

## SECTION 2: Flowchart Diagram
You MUST include a mermaid flowchart diagram at the END of your response.
This diagram should visualize the main flow, process, or logic discussed in the video.

CRITICAL RULES for the mermaid diagram:
- The diagram MUST be wrapped in a fenced code block with language "mermaid"
- Use \`flowchart TD\` syntax (top-down)
- Keep node labels SHORT (max 5 words per node)
- Do NOT use parentheses inside square bracket labels
- Do NOT use special characters like quotes or ampersands in labels
- Use simple arrow connections: A --> B
- Limit to 6-12 nodes maximum for readability
- The diagram MUST be valid mermaid syntax

Example format of your response:
## Video Title Topic

### Key Points
- Point 1
- Point 2

### Details
...content...

\`\`\`mermaid
flowchart TD
    A[Start Topic] --> B[Step One]
    B --> C[Step Two]
    C --> D[Final Result]
\`\`\`

Do NOT skip the mermaid diagram. It is REQUIRED.
Do NOT use filler phrases like "Here is a summary". Jump straight into the content.`;

        const baseUrl =
            process.env.OPENAI_BASE_URL || 'http://127.0.0.1:1234/v1';

        const response = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.OPENAI_API_KEY || 'lm-studio'}`,
            },
            body: JSON.stringify({
                model: 'qwen2.5-coder-7b-instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    {
                        role: 'user',
                        content: `Here is the transcript of the video:\n\n${transcript}`,
                    },
                ],
                stream: true,
                temperature: 0.7,
            }),
        });

        if (!response.ok || !response.body) {
            const errorText = await response.text();
            console.error('LM Studio error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get response from LM Studio. Is it running?' },
                { status: 502 }
            );
        }

        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Summarize API error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
