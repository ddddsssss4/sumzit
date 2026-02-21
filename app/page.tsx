'use client';

import { useChat, Message } from '@ai-sdk/react';
import { VideoForm } from '@/components/video-form';
import { SummaryDisplay } from '@/components/summary-display';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { messages, append, isLoading, setMessages } = useChat({
    api: '/api/summarize',
    onError: (error: Error) => {
      console.error('Error generating summary:', error);
    }
  });

  const handleSubmit = async (url: string) => {
    // Clear previous summary
    setMessages([]);

    // Append a user message to trigger the API
    await append({
      role: 'user',
      content: JSON.stringify({ url }), // we send URL as stringified JSON or text
    });
  };

  // We are interested in the assistant's response
  const assistantMessage = messages.findLast((m: Message) => m.role === 'assistant');

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800">
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-zinc-100 to-transparent dark:from-zinc-900/50 dark:to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <VideoForm onSubmit={handleSubmit} isLoading={isLoading} />

        <AnimatePresence mode="wait">
          {(assistantMessage || isLoading) && (
            <motion.div
              key="content-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SummaryDisplay content={assistantMessage?.content || ''} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
