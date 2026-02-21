'use client';

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle, Code2, Sun, Moon } from 'lucide-react';

interface MermaidDiagramProps {
    chart: string;
}

function initMermaid(isDark: boolean) {
    mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'inherit',
        flowchart: {
            htmlLabels: true,
            useMaxWidth: true,
            curve: 'basis',
        },
        er: {
            useMaxWidth: true,
        },
    });
}

// Initialize with dark theme by default
initMermaid(true);

function sanitizeMermaidChart(chart: string): string {
    let clean = chart
        .trim()
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '  ')
        .replace(/\r\n/g, '\n');

    clean = clean.replace(/\[([^\]]*\([^\]]*\)[^\]]*)\]/g, (match, content) => {
        if (content.startsWith('"') && content.endsWith('"')) return match;
        return `["${content}"]`;
    });

    clean = clean.replace(/(\w+\s+\w+)\s+PK\s+FK/g, '$1 FK');

    return clean;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const [error, setError] = useState<string | null>(null);
    const [svg, setSvg] = useState<string>('');
    const [showSource, setShowSource] = useState(false);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const renderChart = async () => {
            if (!chart || !chart.trim()) {
                setError('No diagram content');
                return;
            }

            // Re-initialize mermaid with the current theme
            initMermaid(isDark);

            const cleanChart = sanitizeMermaidChart(chart);
            console.log('[Mermaid] Rendering chart:', cleanChart.substring(0, 200));

            try {
                const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const { svg: renderedSvg } = await mermaid.render(id, cleanChart);
                setSvg(renderedSvg);
                setError(null);
            } catch (err) {
                console.error('[Mermaid] Render error:', err);

                try {
                    const fallbackChart = cleanChart.replace(
                        /\[([^\]]+)\]/g,
                        (match, content) => {
                            const cleaned = content.replace(/\s*\([^)]*\)/g, '');
                            return `[${cleaned}]`;
                        },
                    );
                    const fallbackId = `mermaid-fb-${Date.now()}`;
                    const { svg: fallbackSvg } = await mermaid.render(fallbackId, fallbackChart);
                    setSvg(fallbackSvg);
                    setError(null);
                } catch {
                    setError(err instanceof Error ? err.message : 'Failed to render diagram');
                }
            }
        };

        renderChart();
    }, [chart, isDark]);

    if (error) {
        return (
            <div className="my-6 rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200/40 dark:border-amber-500/10">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Diagram Error
                    </span>
                    <button
                        onClick={() => setShowSource(!showSource)}
                        className="ml-auto flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                    >
                        <Code2 className="w-3.5 h-3.5" />
                        {showSource ? 'Hide source' : 'View source'}
                    </button>
                </div>
                <p className="px-4 py-2 text-xs text-amber-600/80 dark:text-amber-400/60">
                    {error}
                </p>
                {showSource && (
                    <pre className="px-4 pb-4 text-xs text-amber-900/70 dark:text-amber-200/60 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap">
                        {chart}
                    </pre>
                )}
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="my-6 flex items-center justify-center p-8 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700">
                <p className="text-zinc-400 text-sm">Loading diagram...</p>
            </div>
        );
    }

    return (
        <div className="my-8 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700/50">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700/50">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Flowchart</span>
                <button
                    onClick={() => setIsDark(!isDark)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/50 transition-colors"
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {isDark ? (
                        <>
                            <Sun className="w-3.5 h-3.5" />
                            Light
                        </>
                    ) : (
                        <>
                            <Moon className="w-3.5 h-3.5" />
                            Dark
                        </>
                    )}
                </button>
            </div>
            {/* Diagram */}
            <div
                className={`flex justify-center p-6 overflow-x-auto transition-colors ${isDark
                        ? 'bg-zinc-900'
                        : 'bg-white'
                    }`}
                dangerouslySetInnerHTML={{ __html: svg }}
            />
        </div>
    );
}
