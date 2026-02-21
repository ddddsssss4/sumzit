import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'lm-studio',
  baseURL: process.env.OPENAI_BASE_URL || 'http://127.0.0.1:1234/v1',
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
    }

    // Attempt to fetch transcript
    let transcriptData;
    try {
      transcriptData = await YoutubeTranscript.fetchTranscript(url);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      return NextResponse.json({ error: 'Could not fetch transcript for this video. It might be disabled or unavailable.' }, { status: 400 });
    }

    if (!transcriptData || transcriptData.length === 0) {
      return NextResponse.json({ error: 'The transcript is empty.' }, { status: 400 });
    }

    // Combine transcript pieces into a single text
    // We only take the first ~25 minutes of transcript to avoid context window explosion
    const fullTranscript = transcriptData
      .slice(0, 500) // approx 500 items ~ 30-45 mins depending on speech speed
      .map((t) => t.text)
      .join(' ');

    const systemPrompt = `You are a helpful and intelligent assistant. The user will provide a transcript of a YouTube video.
Your task is to:
1. Provide a comprehensive and well-structured markdown summary of the video. Use headings, bullet points, and bold text for clarity.
2. In addition to the summary, analyze the logic, process, or flow described in the video and provide a \`mermaid\` diagram that visually represents this.
Please end your response with the \`mermaid\` code block. Ensure the mermaid code is valid and uses flowchart TD (or similar) as appropriate.
Do NOT use AI slop language like "Here is a summary...". Just jump straight into the content.`;

    const result = streamText({
      model: openai('model-identifier-doesnt-matter-for-lmstudio'),
      system: systemPrompt,
      prompt: `Here is the transcript of the video:\n\n${fullTranscript}`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('API Summarize Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
