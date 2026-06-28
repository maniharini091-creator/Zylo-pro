import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by blocktypes
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-4 text-sm leading-relaxed text-zinc-300 font-sans">
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Code/Calculation blocks
        if (trimmed.startsWith("```")) {
          const lines = trimmed.split("\n");
          const codeLines = lines.slice(1, lines.length - 1).join("\n");
          return (
            <pre 
              key={index} 
              className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto shadow-inner leading-relaxed"
            >
              {codeLines}
            </pre>
          );
        }

        // Tables (Tax or GST computations usually use pipes | and dashes)
        if (trimmed.includes("|") && trimmed.split("\n")[1]?.includes("-")) {
          const lines = trimmed.split("\n");
          const header = lines[0].split("|").map(s => s.trim()).filter(Boolean);
          const rows = lines.slice(2).map(line => 
            line.split("|").map(s => s.trim()).filter(Boolean)
          ).filter(row => row.length > 0);

          return (
            <div key={index} className="overflow-x-auto my-3 border border-zinc-900 rounded-xl shadow-lg">
              <table className="min-w-full text-xs text-left text-zinc-300 divide-y divide-zinc-900">
                <thead className="bg-zinc-900/40 text-zinc-200 font-display uppercase tracking-wider text-[10px]">
                  <tr>
                    {header.map((col, cIdx) => (
                      <th key={cIdx} className="px-4 py-3 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50 bg-zinc-950/20">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-zinc-900/20 transition-colors">
                      {row.map((cell, cIdx) => {
                        // Check if it's a subtotal or total line
                        const isTotal = cell.toLowerCase().includes("total") || cell.toLowerCase().includes("exemption");
                        return (
                          <td 
                            key={cIdx} 
                            className={`px-4 py-2.5 ${isTotal ? "font-semibold text-cyan-400" : ""}`}
                          >
                            {cell}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // Headers
        if (trimmed.startsWith("#")) {
          const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (match) {
            const level = match[1].length;
            const text = match[2];
            
            // Format inline bolding inside headers
            const parsedText = parseInlineStyling(text);

            if (level === 1) return <h1 key={index} className="text-xl font-display font-bold text-zinc-100 tracking-tight mt-6 mb-2">{parsedText}</h1>;
            if (level === 2) return <h2 key={index} className="text-lg font-display font-semibold text-zinc-100 tracking-tight mt-5 mb-2">{parsedText}</h2>;
            return <h3 key={index} className="text-sm font-display font-semibold text-cyan-400 uppercase tracking-wider mt-4 mb-1">{parsedText}</h3>;
          }
        }

        // Check for specific ICAI score callout
        const scoreMatch = trimmed.match(/(Score|Marks):\s*(\d+\/\d+|\d+\s*out\s*of\s*\d+)/i);
        if (scoreMatch) {
          return (
            <div 
              key={index} 
              className="p-4 rounded-xl bg-cyan-950/25 border border-cyan-500/30 text-cyan-200 shadow-md flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider font-display font-semibold text-cyan-400">Zylo ICAI Evaluation</span>
                <p className="text-sm font-medium leading-relaxed">{parseInlineStyling(trimmed.replace(scoreMatch[0], ""))}</p>
              </div>
              <div className="bg-cyan-950 border border-cyan-500/50 rounded-2xl px-4 py-2 text-center shrink-0">
                <span className="text-[10px] text-zinc-400 uppercase font-display block">ICAI Grade</span>
                <span className="text-xl font-display font-bold text-cyan-400">{scoreMatch[2]}</span>
              </div>
            </div>
          );
        }

        // Unordered lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const items = trimmed.split(/\n[-*]\s+/);
          return (
            <ul key={index} className="list-disc pl-5 space-y-1.5 my-3 text-zinc-300">
              {items.map((item, iIdx) => {
                const cleanItem = iIdx === 0 ? item.replace(/^[-*]\s+/, "") : item;
                return <li key={iIdx}>{parseInlineStyling(cleanItem)}</li>;
              })}
            </ul>
          );
        }

        // Ordered lists
        if (/^\d+\.\s+/.test(trimmed)) {
          const items = trimmed.split(/\n\d+\.\s+/);
          return (
            <ol key={index} className="list-decimal pl-5 space-y-1.5 my-3 text-zinc-300">
              {items.map((item, iIdx) => {
                const cleanItem = iIdx === 0 ? item.replace(/^\d+\.\s+/, "") : item;
                return <li key={iIdx}>{parseInlineStyling(cleanItem)}</li>;
              })}
            </ol>
          );
        }

        // Blockquotes
        if (trimmed.startsWith(">")) {
          const quoteText = trimmed.replace(/^>\s*/, "").replace(/\n>\s*/g, " ");
          return (
            <blockquote 
              key={index} 
              className="pl-4 py-1 border-l-2 border-cyan-500 text-zinc-400 text-xs italic bg-zinc-950/30 rounded-r-lg my-2"
            >
              {parseInlineStyling(quoteText)}
            </blockquote>
          );
        }

        // Default Paragraph
        return (
          <p key={index} className="text-zinc-300 leading-relaxed font-sans">
            {parseInlineStyling(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Simple inline styling function to parse bold **text**, section codes Section \d+, and tax sections
function parseInlineStyling(text: string) {
  if (!text) return "";

  // Split by bold patterns **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const cleanBold = part.slice(2, -2);
          return (
            <strong key={idx} className="font-semibold text-zinc-100">
              {highlightSections(cleanBold)}
            </strong>
          );
        }
        return <span key={idx}>{highlightSections(part)}</span>;
      })}
    </>
  );
}

// Function to highlight statutory section numbers (e.g. Section 17(5) or Sec 43B) for CA aesthetics
function highlightSections(text: string) {
  const pattern = /(Section\s+\d+\([a-zA-Z0-9()]+\)|Section\s+\d+[a-zA-Z0-9]*|Sec\s+\d+[a-zA-Z0-9]*)/gi;
  const parts = text.split(pattern);

  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, idx) => {
        if (part.match(pattern)) {
          return (
            <span 
              key={idx} 
              className="px-1.5 py-0.5 mx-0.5 text-xs font-mono rounded bg-zinc-900 border border-zinc-800 text-cyan-300 font-medium"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
