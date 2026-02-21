'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TranscriptPreviewProps {
    transcript: string;
    isVisible: boolean;
}

export function TranscriptPreview({ transcript, isVisible }: TranscriptPreviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!isVisible || !transcript) return null;

    // Truncated preview (first ~600 chars)
    const previewLength = 600;
    const isLong = transcript.length > previewLength;
    const displayText = isExpanded ? transcript : transcript.slice(0, previewLength);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl mx-auto mt-10"
        >
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Transcript
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-auto">
                        {transcript.length.toLocaleString()} chars
                    </span>
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                        {displayText}
                        {isLong && !isExpanded && (
                            <span className="text-zinc-400 dark:text-zinc-500">...</span>
                        )}
                    </p>

                    {isLong && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="mt-3 flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUp className="w-3.5 h-3.5" />
                                    Show less
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3.5 h-3.5" />
                                    Show full transcript
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
