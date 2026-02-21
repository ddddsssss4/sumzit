'use client';

import React, { useEffect, useRef, useState, useId } from 'react';
import mermaid from 'mermaid';
import { AlertTriangle, Code2 } from 'lucide-react';

interface MermaidDiagramProps {
    chart: string;
}

/**
 * Sanitize common LLM-generated Mermaid syntax issues:
 * 1. Parentheses inside square bracket labels: [CDN (fast)] → ["CDN (fast)"]
 * 2. Double qualifiers in erDiagram: PK FK → FK
 * 3. SQL constraint syntax: PRIMARY KEY (a,b) → removed
 */
function sanitizeMermaidSyntax(input: string): string {
    let chart = input;

    // Fix square bracket labels containing parentheses — quote them
    // e.g. [CDN (fast)] → ["CDN (fast)"]
    chart = chart.replace(
        /\[([^\]]*\([^)]*\)[^\]]*)\]/g,
        (_, content) => `["${content.replace(/"/g, '')}"]`,
    );

    // Fix double qualifiers in erDiagram (PK FK → FK)
    chart = chart.replace(/\bPK\s+FK\b/g, 'FK');
    chart = chart.replace(/\bFK\s+PK\b/g, 'FK');

    // Remove SQL constraint syntax (PRIMARY KEY(...), FOREIGN KEY(...), etc.)
    chart = chart.replace(/(?:PRIMARY|FOREIGN)\s+KEY\s*\([^)]*\)/gi, '');

    // Remove UNIQUE constraint syntax
    chart = chart.replace(/\bUNIQUE\s*\([^)]*\)/gi, '');

    // Clean up any double-quoted labels that might already be quoted
    chart = chart.replace(/\[""+/g, '["');
    chart = chart.replace(/""+\]/g, '"]');

    return chart;
}

let mermaidInitialized = false;

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showSource, setShowSource] = useState(false);
    const uniqueId = useId().replace(/:/g, '_');

    useEffect(() => {
        if (!mermaidInitialized) {
            const isDark =
                typeof window !== 'undefined' &&
                window.matchMedia('(prefers-color-scheme: dark)').matches;

            mermaid.initialize({
                startOnLoad: false,
                theme: isDark ? 'dark' : 'base',
                themeVariables: isDark
                    ? {
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                        primaryColor: '#27272a',
                        primaryTextColor: '#fafafa',
                        primaryBorderColor: '#3f3f46',
                        lineColor: '#71717a',
                        secondaryColor: '#18181b',
                        tertiaryColor: '#09090b',
                    }
                    : {
                        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
                        primaryColor: '#f4f4f5',
                        primaryTextColor: '#18181b',
                        primaryBorderColor: '#e4e4e7',
                        lineColor: '#a1a1aa',
                        secondaryColor: '#fafafa',
                        tertiaryColor: '#fff',
                    },
                securityLevel: 'loose',
                flowchart: { curve: 'basis', padding: 16 },
            });
            mermaidInitialized = true;
        }

        const renderChart = async () => {
            if (!containerRef.current || !chart.trim()) return;

            try {
                setError(null);
                setSvg('');

                const sanitized = sanitizeMermaidSyntax(chart);
                const id = `mermaid_${uniqueId}_${Date.now()}`;

                const { svg: svgResult } = await mermaid.render(id, sanitized);
                setSvg(svgResult);
            } catch (err: any) {
                console.error('Mermaid rendering error:', err);

                // Try a second time with even more aggressive cleanup
                try {
                    let fallbackChart = sanitizeMermaidSyntax(chart);
                    // Strip all parentheses content as last resort
                    fallbackChart = fallbackChart.replace(/\(([^)]*)\)/g, '');
                    const fallbackId = `mermaid_fb_${uniqueId}_${Date.now()}`;
                    const { svg: svgResult } = await mermaid.render(
                        fallbackId,
                        fallbackChart,
                    );
                    setSvg(svgResult);
                } catch {
                    setError(
                        err?.message ||
                        'Failed to render diagram. The AI generated invalid Mermaid syntax.',
                    );
                }
            }
        };

        // Small delay for streaming — don't render incomplete charts
        const timeout = setTimeout(renderChart, 200);
        return () => clearTimeout(timeout);
    }, [chart, uniqueId]);

    if (error) {
        return (
            <div className="my-6 rounded-xl border border-amber-200/60 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-500/5 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200/40 dark:border-amber-500/10">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Diagram could not be rendered
                    </span>
                    <button
                        onClick={() => setShowSource(!showSource)}
                        className="ml-auto flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                    >
                        <Code2 className="w-3.5 h-3.5" />
                        {showSource ? 'Hide source' : 'View source'}
                    </button>
                </div>
                {showSource && (
                    <pre className="p-4 text-xs text-amber-900/70 dark:text-amber-200/60 overflow-x-auto font-mono leading-relaxed">
                        {chart}
                    </pre>
                )}
            </div>
        );
    }

    if (!svg) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className="my-8 flex justify-center w-full max-w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6 shadow-sm"
        >
            <div
                dangerouslySetInnerHTML={{ __html: svg }}
                className="w-full h-auto flex items-center justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            />
        </div>
    );
}
