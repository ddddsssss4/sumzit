const RE_YOUTUBE =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;

/**
 * Extract the 11-character video ID from any YouTube URL format.
 */
export function extractVideoId(input: string): string {
    if (input.length === 11 && /^[\w-]+$/.test(input)) return input;
    const match = input.match(RE_YOUTUBE);
    if (match?.[1]) return match[1];
    throw new Error('Could not extract a valid YouTube video ID from the URL.');
}

interface TranscriptSegment {
    text: string;
    offset: number;
    duration: number;
}

/**
 * Fetch the transcript for a YouTube video using the Android innertube
 * player API. This bypasses the server-side blocks that YouTube applies
 * to the standard timedtext endpoint for ASR (auto-generated) captions.
 */
export async function fetchTranscript(
    videoIdOrUrl: string,
): Promise<TranscriptSegment[]> {
    const videoId = extractVideoId(videoIdOrUrl);

    // Step 1: Use Android innertube client to get caption track URLs
    const playerPayload = {
        context: {
            client: {
                clientName: 'ANDROID',
                clientVersion: '19.09.37',
                androidSdkVersion: 30,
                hl: 'en',
                gl: 'US',
            },
        },
        videoId,
    };

    const playerRes = await fetch(
        'https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8&prettyPrint=false',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent':
                    'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
            },
            body: JSON.stringify(playerPayload),
        },
    );

    if (!playerRes.ok) {
        throw new Error(`Player API returned status ${playerRes.status}`);
    }

    const playerData = await playerRes.json();
    const captionTracks =
        playerData.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (!captionTracks || captionTracks.length === 0) {
        throw new Error(
            'No captions available for this video. The video might not have subtitles enabled.',
        );
    }

    // Prefer English, otherwise fall back to the first available track
    const englishTrack = captionTracks.find(
        (t: any) => t.languageCode === 'en',
    );
    const chosenTrack = englishTrack || captionTracks[0];

    // Step 2: Fetch the transcript XML from the caption track URL
    const transcriptRes = await fetch(chosenTrack.baseUrl, {
        headers: {
            'User-Agent':
                'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
        },
    });

    if (!transcriptRes.ok) {
        throw new Error(
            `Transcript fetch returned status ${transcriptRes.status}`,
        );
    }

    const transcriptXml = await transcriptRes.text();

    if (!transcriptXml || transcriptXml.length === 0) {
        throw new Error('Received an empty transcript response from YouTube.');
    }

    // Step 3: Parse the XML. YouTube returns two possible formats:
    //   Format 1 (simple): <text start="..." dur="...">content</text>
    //   Format 2 (srv3):   <p t="..." d="..."><s>word</s>...</p>
    const segments: TranscriptSegment[] = [];

    // Try format 2 first (srv3 with <p> and <s> tags)
    const pRegex = /<p t="(\d+)" d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g;
    let pMatch;
    while ((pMatch = pRegex.exec(transcriptXml)) !== null) {
        const offset = parseInt(pMatch[1], 10);
        const duration = parseInt(pMatch[2], 10);
        const innerHtml = pMatch[3];

        // Extract text from <s> tags within the <p>
        const sRegex = /<s[^>]*>([^<]*)<\/s>/g;
        let text = '';
        let sMatch;
        while ((sMatch = sRegex.exec(innerHtml)) !== null) {
            text += sMatch[1];
        }

        // If no <s> tags, use the raw inner text
        if (!text) {
            text = innerHtml.replace(/<[^>]+>/g, '').trim();
        }

        if (text) {
            segments.push({
                text: decodeHtmlEntities(text.trim()),
                offset: offset / 1000,
                duration: duration / 1000,
            });
        }
    }

    // If format 2 didn't match, try format 1 (simple <text> tags)
    if (segments.length === 0) {
        const textRegex =
            /<text start="([^"]*)" dur="([^"]*)"[^>]*>([^<]*)<\/text>/g;
        let textMatch;
        while ((textMatch = textRegex.exec(transcriptXml)) !== null) {
            segments.push({
                text: decodeHtmlEntities(textMatch[3]),
                offset: parseFloat(textMatch[1]),
                duration: parseFloat(textMatch[2]),
            });
        }
    }

    if (segments.length === 0) {
        throw new Error(
            'Could not parse transcript. The format might be unsupported.',
        );
    }

    return segments;
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/');
}
