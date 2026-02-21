'use client';

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';

interface MermaidDiagramProps {
    chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
                fontFamily: 'var(--font-geist-sans), sans-serif',
                primaryColor: '#f4f4f5', // zinc-100
                primaryTextColor: '#18181b', // zinc-900
                primaryBorderColor: '#e4e4e7', // zinc-200
                lineColor: '#a1a1aa', // zinc-400
                secondaryColor: '#fafafa', // zinc-50
                tertiaryColor: '#fff',
            },
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        });

        const renderChart = async () => {
            if (!containerRef.current) return;
            try {
                setError(null);
                // Simple random ID to prevent conflicts when rendering multiple diagrams
                const id = `mermaid-${Math.floor(Math.random() * 100000)}`;
                const { svg: svgResult } = await mermaid.render(id, chart);
                setSvg(svgResult);
            } catch (err) {
                console.error('Mermaid rendering error:', err);
                setError('Failed to render diagram. The AI might have generated invalid Mermaid syntax.');
            }
        };

        if (chart) {
            // Delay render slightly to ensure CSS/fonts are loaded nicely
            const timeout = setTimeout(renderChart, 100);
            return () => clearTimeout(timeout);
        }
    }, [chart]);

    if (error) {
        return (
            <div className="p-4 border border-red-500/20 bg-red-500/10 rounded-xl text-red-500 text-sm font-medium">
                {error}
            </div>
        );
    }

    return (
        <div className="my-8 flex justify-center w-full max-w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6 shadow-sm">
            {svg ? (
                <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full h-auto flex items-center justify-center" />
            ) : (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    <p className="text-sm">Rendering diagram...</p>
                </div>
            )}
        </div>
    );
}
