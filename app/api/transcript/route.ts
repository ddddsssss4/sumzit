import { NextResponse } from 'next/server';
import { fetchTranscript } from '@/lib/youtube-transcript';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json(
                { error: 'YouTube URL is required' },
                { status: 400 }
            );
        }

        let segments;
        try {
            segments = await fetchTranscript(url);
        } catch (error: any) {
            console.error('Transcript error:', error);
            return NextResponse.json(
                { error: error.message || 'Could not fetch transcript.' },
                { status: 400 }
            );
        }

        if (!segments || segments.length === 0) {
            return NextResponse.json(
                { error: 'The transcript is empty.' },
                { status: 400 }
            );
        }

        const fullText = segments.map((s) => s.text).join(' ');

        return NextResponse.json({ transcript: fullText });
    } catch (error) {
        console.error('Transcript API error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
