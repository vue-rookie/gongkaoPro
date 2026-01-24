'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Info, Lightbulb, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface Props {
  content: string;
  className?: string;
}

// Analysis Panel Component
const AnalysisPanel = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full my-4 flex items-center justify-between p-4 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all duration-200 group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg text-amber-600 shadow-sm ring-1 ring-amber-50 group-hover:scale-110 transition-transform">
            <Lightbulb size={20} className="fill-amber-100/50" />
          </div>
          <div className="text-left">
            <div className="font-bold text-stone-700 text-sm font-sans">查看专家解析</div>
            <div className="text-stone-400 text-xs mt-0.5 font-medium font-sans">思考完毕后点击查看答案与详解</div>
          </div>
        </div>
        <div className="bg-white p-1.5 rounded-full text-stone-400 group-hover:text-stone-600 transition-colors">
           <Eye size={18} />
        </div>
      </button>
    );
  }

  return (
    <div className="my-4 rounded-xl border border-stone-200 bg-stone-50/50 overflow-hidden animate-in fade-in slide-in-from-top-2 shadow-sm">
      <div 
        className="bg-stone-100 px-4 py-2.5 border-b border-stone-200 flex justify-between items-center cursor-pointer hover:bg-stone-200/50 transition-colors select-none"
        onClick={() => setIsOpen(false)}
      >
        <div className="flex items-center gap-2 text-stone-700 font-bold text-sm font-sans">
          <CheckCircle2 size={16} className="text-stone-500" />
          <span>专家解析与技巧</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-500 text-xs bg-white/50 px-2 py-1 rounded-md">
          <span className="font-medium font-sans">收起</span>
          <EyeOff size={14} />
        </div>
      </div>
      <div className="p-5 bg-white font-serif-sc">
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

// SVG Block Component
const SvgBlock = ({ content }: { content: string }) => {
  const titleMatch = content.match(/<title.*?>(.*?)<\/title>/i);
  const description = titleMatch ? titleMatch[1] : 'AI 生成的图形推理演示';
  
  let cleanSvg = content.replace(/^svg/i, '').trim();
  
  // Clean up potential markdown code block artifacts
  cleanSvg = cleanSvg.replace(/^```(svg|xml)?/i, '').replace(/```$/, '').trim();

  // If missing SVG tag but has SVG-like content, wrap it
  if (!cleanSvg.startsWith('<svg') && (cleanSvg.includes('<path') || cleanSvg.includes('<polygon') || cleanSvg.includes('<rect') || cleanSvg.includes('<circle') || cleanSvg.includes('</svg>'))) {
     // If it has a closing tag but no opening, remove the closing to prevent duplicates when we wrap
     if (cleanSvg.endsWith('</svg>')) {
        cleanSvg = cleanSvg.substring(0, cleanSvg.lastIndexOf('</svg>'));
     }
     cleanSvg = `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" stroke="black" fill="none" style="max-width:100%; height:auto;">${cleanSvg}</svg>`;
  }

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-stone-200 bg-white">
      <div 
        className="p-4 flex justify-center items-center shadow-sm min-h-[150px]"
        dangerouslySetInnerHTML={{ __html: cleanSvg }}
      />
      <div className="absolute top-2 right-2 transition-opacity duration-200">
         <div className="group/tooltip relative">
            <div className="bg-stone-50/80 backdrop-blur-sm text-stone-500 p-1.5 rounded-full cursor-help hover:bg-stone-100 border border-stone-200 shadow-sm">
               <Info size={16} />
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-stone-800/95 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10 pointer-events-none text-center backdrop-blur font-sans">
               {description}
               <div className="absolute -top-1 right-2 w-2 h-2 bg-stone-800/95 rotate-45"></div>
            </div>
         </div>
      </div>
    </div>
  );
};

// --- Custom Component Definitions ---

// Helper to check for SVG content similarity
const looksLikeSvgContent = (str: string) => {
    const s = str.trim();
    return s.startsWith('<svg') || 
           s.startsWith('```svg') ||
           s.includes('xmlns="http://www.w3.org/2000/svg"') ||
           s.endsWith('</svg>') ||
           (s.includes('<polygon') && s.includes('points=')) ||
           (s.includes('<path') && s.includes('d=')) ||
           (s.includes('<rect') && s.includes('width=')) ||
           (s.includes('<circle') && s.includes('cx='));
};

const CustomPre = ({ node, children, ...props }: any) => {
    // Attempt to extract the language from the child <code> element
    const codeNode = node?.children?.find((child: any) => child.tagName === 'code');
    const className = codeNode?.properties?.className || [];
    const rawContent = codeNode?.children?.[0]?.value || '';
    const contentStr = String(rawContent).trim();

    const isSvgLang = Array.isArray(className) ? className.includes('language-svg') : (typeof className === 'string' && className.includes('language-svg'));
    const isAnalysis = Array.isArray(className) ? className.includes('language-analysis') : (typeof className === 'string' && className.includes('language-analysis'));
    
    // Check content if language tag is missing
    const isSvgContent = looksLikeSvgContent(contentStr);

    if (isSvgLang || isAnalysis || isSvgContent) {
        // Render children directly so the `code` component can handle it
        return <>{children}</>;
    }

    return (
        <div className="bg-stone-800 rounded-lg p-3 my-3 overflow-x-auto shadow-sm border border-stone-700">
            <pre className="font-mono text-sm text-stone-100" {...props}>{children}</pre>
        </div>
    );
};

const CustomCode = ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    let lang = match ? match[1] : '';
    const content = String(children).replace(/\n$/, '').trim();

    // Auto-detect SVG if language is missing or generic but content looks like SVG
    if (!lang || lang === 'xml' || lang === 'html') {
        if (looksLikeSvgContent(content)) {
            lang = 'svg';
        }
    }

    if (lang === 'analysis') {
        return <AnalysisPanel content={content} />;
    }

    if (lang === 'svg') {
        return <SvgBlock content={content} />;
    }

    const isInline = !className;
    if (isInline) {
        return <code className="bg-stone-100 rounded px-1.5 py-0.5 text-[0.9em] font-mono text-stone-600 border border-stone-200" {...props}>{children}</code>;
    }

    return <code className={`${className} font-mono text-sm`} {...props}>{children}</code>;
};

const MARKDOWN_COMPONENTS = {
    h1: ({node, ...props}: any) => <h4 className="font-bold my-3 text-stone-900 font-sans" {...props} />,
    h2: ({node, ...props}: any) => <h5 className="font-bold my-3 text-stone-900 font-sans" {...props} />,
    h3: ({node, ...props}: any) => <h6 className="font-bold my-2 text-stone-800 font-sans" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-3 last:mb-0 text-stone-700 leading-7" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-stone-900" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-outside ml-4 my-2 space-y-1 text-stone-700" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-outside ml-4 my-2 space-y-1 text-stone-700" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-stone-300 pl-4 py-1 my-3 italic text-stone-600 font-serif" {...props} />,
    table: ({node, ...props}: any) => (
        <div className="overflow-x-auto my-3 rounded border border-stone-200">
            <table className="min-w-full divide-y divide-stone-200 text-xs md:text-sm font-sans" {...props} />
        </div>
    ),
    th: ({node, ...props}: any) => <th className="px-3 py-2 text-left font-semibold text-stone-600 bg-stone-50" {...props} />,
    td: ({node, ...props}: any) => <td className="px-3 py-2 text-stone-700 border-t border-stone-100" {...props} />,
    pre: CustomPre,
    code: CustomCode
};

// --- Main Component ---

const MarkdownRenderer: React.FC<Props> = ({ content, className }) => {
  // Use prose-stone for warmer, neutral tones
  const finalClass = className 
    ? `prose prose-stone max-w-none dark:prose-invert leading-relaxed text-stone-800 font-serif-sc ${className}`
    : `prose prose-stone prose-sm md:prose-base max-w-none dark:prose-invert leading-relaxed text-stone-800 font-serif-sc`;

  return (
    <div className={finalClass}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeKatex, { strict: false, throwOnError: false }]]}
        components={MARKDOWN_COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;