'use client';

import { useState, useCallback } from 'react';
import { VideoForm } from '@/components/video-form';
import { SummaryDisplay } from '@/components/summary-display';
import { TranscriptPreview } from '@/components/transcript-preview';
import { BackgroundDecoration } from '@/components/background-decoration';
import { AnimatePresence, motion } from 'framer-motion';

type Phase = 'idle' | 'fetching-transcript' | 'summarizing' | 'done';

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (url: string) => {
    // Reset state
    setTranscript('');
    setSummary('');
    setError(null);
    setPhase('fetching-transcript');

    try {
      // Phase 1: Fetch transcript
      const transcriptRes = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!transcriptRes.ok) {
        const data = await transcriptRes.json();
        throw new Error(data.error || 'Failed to fetch transcript');
      }

      const { transcript: fetchedTranscript } = await transcriptRes.json();
      setTranscript(fetchedTranscript);

      // Phase 2: Stream summary from LM Studio
      setPhase('summarizing');

      const summaryRes = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: fetchedTranscript }),
      });

      if (!summaryRes.ok) {
        const data = await summaryRes.json();
        throw new Error(data.error || 'Failed to generate summary');
      }

      const reader = summaryRes.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              setSummary((prev) => prev + delta);
            }
          } catch {
            // skip
          }
        }
      }

      setPhase('done');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setPhase('idle');
    }
  }, []);

  const isLoading = phase === 'fetching-transcript' || phase === 'summarizing';

  return (
    <main className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <BackgroundDecoration />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <VideoForm onSubmit={handleSubmit} isLoading={isLoading} />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 max-w-2xl mx-auto p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence>
          <TranscriptPreview
            transcript={transcript}
            isVisible={!!transcript}
          />
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {(summary || phase === 'summarizing') && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SummaryDisplay
                content={summary}
                isLoading={phase === 'summarizing'}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
