'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MermaidDiagram } from './mermaid-diagram';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

interface SummaryDisplayProps {
    content: string;
    isLoading: boolean;
}

export function SummaryDisplay({ content, isLoading }: SummaryDisplayProps) {
    // Check if a mermaid code block is complete (has closing ```)
    const hasMermaidBlock = content.includes('```mermaid');
    const mermaidBlockComplete = useMemo(() => {
        if (!hasMermaidBlock) return false;
        const mermaidStart = content.indexOf('```mermaid');
        const afterStart = content.indexOf('\n', mermaidStart);
        if (afterStart === -1) return false;
        const closingBackticks = content.indexOf('```', afterStart + 1);
        return closingBackticks !== -1;
    }, [content, hasMermaidBlock]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl mx-auto mt-10"
        >
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-500/10">
                        <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        AI Summary
                    </span>
                    {isLoading && (
                        <div className="flex items-center gap-1.5 ml-auto">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                            <span className="text-xs text-zinc-400">Generating...</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="px-5 py-6 md:px-8 md:py-8">
                    {!content && isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-sm font-medium">
                                Generating summary from transcript...
                            </span>
                            <span className="text-xs text-zinc-400/60">
                                This may take a moment depending on the video length
                            </span>
                        </div>
                    )}

                    {content && (
                        <article className="prose prose-zinc dark:prose-invert prose-p:leading-relaxed max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({ className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const language = match ? match[1] : '';
                                        const codeContent = String(children).replace(/\n$/, '');
                                        const isInline = !match && !codeContent.includes('\n');

                                        if (!isInline && language === 'mermaid') {
                                            // Only render mermaid if the block is complete
                                            if (!mermaidBlockComplete) {
                                                return (
                                                    <div className="my-6 flex items-center gap-2 text-zinc-400 text-sm">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Building diagram...
                                                    </div>
                                                );
                                            }
                                            return <MermaidDiagram chart={codeContent} />;
                                        }

                                        return !isInline ? (
                                            <div className="relative my-6 overflow-hidden rounded-xl bg-zinc-950 p-4 border border-zinc-800">
                                                <pre className="!bg-transparent !m-0 !p-0 overflow-x-auto">
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            </div>
                                        ) : (
                                            <code
                                                className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-sm before:content-none after:content-none"
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                    h1: ({ children }) => (
                                        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                                            {children}
                                        </h1>
                                    ),
                                    h2: ({ children }) => (
                                        <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mt-10 mb-4">
                                            {children}
                                        </h2>
                                    ),
                                    h3: ({ children }) => (
                                        <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mt-8 mb-3">
                                            {children}
                                        </h3>
                                    ),
                                    ul: ({ children }) => (
                                        <ul className="list-disc list-outside ml-6 space-y-2 mb-6 marker:text-zinc-400">
                                            {children}
                                        </ul>
                                    ),
                                    ol: ({ children }) => (
                                        <ol className="list-decimal list-outside ml-6 space-y-2 mb-6 marker:text-zinc-400">
                                            {children}
                                        </ol>
                                    ),
                                    li: ({ children }) => (
                                        <li className="text-zinc-700 dark:text-zinc-300 pl-1">
                                            {children}
                                        </li>
                                    ),
                                    p: ({ children }) => (
                                        <p className="text-zinc-700 dark:text-zinc-300 mb-6 leading-7">
                                            {children}
                                        </p>
                                    ),
                                    strong: ({ children }) => (
                                        <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            {children}
                                        </strong>
                                    ),
                                    a: ({ children, href }) => (
                                        <a
                                            href={href}
                                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 transition-colors"
                                        >
                                            {children}
                                        </a>
                                    ),
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-zinc-200 dark:border-zinc-700 pl-4 italic text-zinc-600 dark:text-zinc-400 my-6">
                                            {children}
                                        </blockquote>
                                    ),
                                    table: ({ children }) => (
                                        <div className="my-6 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
                                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 !my-0">
                                                {children}
                                            </table>
                                        </div>
                                    ),
                                    thead: ({ children }) => (
                                        <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                            {children}
                                        </thead>
                                    ),
                                    th: ({ children }) => (
                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider">
                                            {children}
                                        </th>
                                    ),
                                    td: ({ children }) => (
                                        <td className="px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 border-t border-zinc-100 dark:border-zinc-800">
                                            {children}
                                        </td>
                                    ),
                                }}
                            >
                                {content}
                            </ReactMarkdown>
                        </article>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
