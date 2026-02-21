'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Youtube, Loader2, Sparkles } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface VideoFormProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
}

export function VideoForm({ onSubmit, isLoading }: VideoFormProps) {
    const [url, setUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim() || isLoading) return;
        onSubmit(url);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl mx-auto flex flex-col items-center space-y-8"
        >
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="inline-flex items-center justify-center p-2 bg-red-50 dark:bg-red-500/10 rounded-2xl mb-2"
                >
                    <Youtube className="w-6 h-6 text-red-500" />
                </motion.div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                    Sumzit
                </h1>
                <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    Paste a YouTube link and get an instant AI summary with a logic flowchart.
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="w-full relative group flex items-center"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-zinc-200 dark:from-zinc-800 dark:to-zinc-800 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500 -z-10" />
                <div className="relative flex w-full items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl p-2 transition-shadow focus-within:ring-2 focus-within:ring-zinc-900/10 dark:focus-within:ring-zinc-100/10">
                    <div className="pl-3 pr-2 text-zinc-400">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isLoading}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="flex-1 bg-transparent border-none outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 px-2 min-w-0"
                        required
                    />
                    <button
                        type="submit"
                        disabled={!url.trim() || isLoading}
                        className={cn(
                            "ml-2 flex items-center justify-center px-4 py-2.5 rounded-xl font-medium tracking-wide transition-all duration-300",
                            "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed",
                            "shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <span className="hidden sm:inline mr-2">Summarize</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
