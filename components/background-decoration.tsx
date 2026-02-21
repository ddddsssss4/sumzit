'use client';

import { motion } from 'framer-motion';

export function BackgroundDecoration() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Top gradient */}
            <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-zinc-100 via-zinc-50/80 to-transparent dark:from-zinc-900 dark:via-zinc-950/80 dark:to-transparent" />

            {/* Floating orbs */}
            <motion.div
                animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-32 -left-20 w-72 h-72 rounded-full bg-gradient-to-br from-red-100/40 to-orange-100/30 dark:from-red-500/5 dark:to-orange-500/5 blur-3xl"
            />
            <motion.div
                animate={{ y: [0, 15, 0], x: [0, -12, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute top-20 -right-16 w-80 h-80 rounded-full bg-gradient-to-bl from-violet-100/30 to-blue-100/20 dark:from-violet-500/5 dark:to-blue-500/5 blur-3xl"
            />
            <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute top-[500px] left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-t from-zinc-200/30 to-transparent dark:from-zinc-800/20 blur-3xl"
            />

            {/* Grid pattern overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Abstract geometric shapes */}
            <svg className="absolute top-16 right-[15%] w-48 h-48 opacity-[0.06] dark:opacity-[0.08]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.circle
                    cx="100" cy="100" r="80"
                    stroke="currentColor" strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.circle
                    cx="100" cy="100" r="60"
                    stroke="currentColor" strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                />
                <motion.circle
                    cx="100" cy="100" r="40"
                    stroke="currentColor" strokeWidth="0.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />
            </svg>

            <svg className="absolute bottom-32 left-[10%] w-36 h-36 opacity-[0.05] dark:opacity-[0.07]" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path
                    d="M75 10 L140 75 L75 140 L10 75 Z"
                    stroke="currentColor" strokeWidth="0.5"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: 'center' }}
                />
                <motion.path
                    d="M75 30 L120 75 L75 120 L30 75 Z"
                    stroke="currentColor" strokeWidth="0.5"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    style={{ transformOrigin: 'center' }}
                />
            </svg>

            {/* Dashed arcs */}
            <svg className="absolute top-48 left-[5%] w-64 h-64 opacity-[0.04] dark:opacity-[0.06]" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                <motion.path
                    d="M 50 200 Q 50 50 200 50"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    strokeDasharray="4 8"
                    fill="none"
                    animate={{ strokeDashoffset: [0, -48] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
            </svg>

            {/* Dots cluster */}
            <svg className="absolute bottom-48 right-[8%] w-40 h-40 opacity-[0.06] dark:opacity-[0.08]" viewBox="0 0 160 160" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                {[0, 1, 2, 3, 4].map(row =>
                    [0, 1, 2, 3, 4].map(col => (
                        <circle key={`${row}-${col}`} cx={20 + col * 30} cy={20 + row * 30} r="1.5" opacity={0.3 + ((row * 5 + col) % 7) * 0.08} />
                    ))
                )}
            </svg>
        </div>
    );
}
