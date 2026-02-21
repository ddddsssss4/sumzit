'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MermaidDiagram } from './mermaid-diagram';
import { motion } from 'framer-motion';

interface SummaryDisplayProps {
    content: string;
}

export function SummaryDisplay({ content }: SummaryDisplayProps) {
    // Extract mermaid code blocks to render them cleanly
    // If the stream is still generating the mermaid block, we might have partial blocks,
    // but react-markdown will just render them as normal code blocks until completable if we are clever,
    // or we can just render the mermaid component if we detect ```mermaid

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto mt-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl p-6 md:p-10"
        >
            <article className="prose prose-zinc dark:prose-invert prose-p:leading-relaxed max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            const codeContent = String(children).replace(/\n$/, '');

                            if (!inline && language === 'mermaid') {
                                return <MermaidDiagram chart={codeContent} />;
                            }

                            return !inline ? (
                                <div className="relative my-6 overflow-hidden rounded-xl bg-zinc-950 p-4 border border-zinc-800">
                                    <pre className="!bg-transparent !m-0 !p-0">
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    </pre>
                                </div>
                            ) : (
                                <code className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-sm before:content-none after:content-none" {...props}>
                                    {children}
                                </code>
                            );
                        },
                        h1: ({ children }) => <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mt-10 mb-4">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mt-8 mb-3">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc list-outside ml-6 space-y-2 mb-6 marker:text-zinc-400">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-outside ml-6 space-y-2 mb-6 marker:text-zinc-400">{children}</ol>,
                        li: ({ children }) => <li className="text-zinc-700 dark:text-zinc-300 pl-1">{children}</li>,
                        p: ({ children }) => <p className="text-zinc-700 dark:text-zinc-300 mb-6 leading-7">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{children}</strong>,
                        a: ({ children, href }) => <a href={href} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 derivation transition-colors">{children}</a>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-zinc-200 dark:border-zinc-700 pl-4 italic text-zinc-600 dark:text-zinc-400 my-6">{children}</blockquote>,
                    }}
                >
                    {content}
                </ReactMarkdown>
            </article>
        </motion.div>
    );
}
