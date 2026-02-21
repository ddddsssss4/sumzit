import { NextResponse } from 'next/server';
import { fetchTranscript } from '@/lib/youtube-transcript';

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: 'YouTube URL is required' },
                { status: 400 }
            );
        }

        // Fetch transcript using custom Android innertube fetcher
        let transcriptSegments;
        try {
            transcriptSegments = await fetchTranscript(url);
        } catch (error: any) {
            console.error('Error fetching transcript:', error);
            return NextResponse.json(
                {
                    error:
                        error.message ||
                        'Could not fetch transcript for this video. It might be disabled or unavailable.',
                },
                { status: 400 }
            );
        }

        if (!transcriptSegments || transcriptSegments.length === 0) {
            return NextResponse.json(
                { error: 'The transcript is empty.' },
                { status: 400 }
            );
        }

        // Combine all transcript pieces into a single text
        const fullTranscript = transcriptSegments
            .map((t) => t.text)
            .join(' ');

        const systemPrompt = `You are a helpful and intelligent assistant. The user will provide a transcript of a YouTube video.
Your task is to:
1. Provide a comprehensive and well-structured markdown summary of the video. Use headings, bullet points, and bold text for clarity.
2. In addition to the summary, analyze the logic, process, or flow described in the video and provide a \`mermaid\` diagram that visually represents this.
Please end your response with the mermaid code block wrapped in triple backticks with language identifier "mermaid". Ensure the mermaid code is valid and uses flowchart TD (or similar) as appropriate.
Do NOT use AI slop language like "Here is a summary...". Just jump straight into the content.`;

        // Call LM Studio's OpenAI-compatible chat completions endpoint with streaming
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
                        content: `Here is the transcript of the video:\n\n${fullTranscript}`,
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

        // Pipe the SSE stream directly back to the client
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            },
        });
    } catch (error) {
        console.error('API Summarize Error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
