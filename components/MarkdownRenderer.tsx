import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Info, Lightbulb, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

interface Props {
  content: string;
}

// Separate plugins to reuse in the recursive render
const remarkPlugins = [remarkMath, remarkGfm];
const rehypePlugins = [rehypeRaw, [rehypeKatex, { strict: false, throwOnError: false }]];

// Collapsible Analysis Component
const AnalysisPanel = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full my-4 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-100 rounded-xl transition-all duration-200 group shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg text-blue-600 shadow-sm ring-1 ring-blue-50 group-hover:scale-110 transition-transform">
            <Lightbulb size={20} className="fill-blue-100/50" />
          </div>
          <div className="text-left">
            <div className="font-bold text-blue-900 text-sm">查看专家解析</div>
            <div className="text-blue-500 text-xs mt-0.5 font-medium">思考完毕后点击查看答案与详解</div>
          </div>
        </div>
        <div className="bg-white/60 p-1.5 rounded-full text-blue-400 group-hover:text-blue-600 transition-colors">
           <Eye size={18} />
        </div>
      </button>
    );
  }

  return (
    <div className="my-4 rounded-xl border border-amber-200 bg-amber-50/30 overflow-hidden animate-in fade-in slide-in-from-top-2 shadow-sm ring-1 ring-amber-100">
      <div 
        className="bg-amber-100/80 px-4 py-2.5 border-b border-amber-200 flex justify-between items-center cursor-pointer hover:bg-amber-100 transition-colors select-none"
        onClick={() => setIsOpen(false)}
      >
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <CheckCircle2 size={16} className="text-amber-600" />
          <span>专家解析与技巧</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-700 text-xs bg-white/50 px-2 py-1 rounded-md">
          <span className="font-medium">收起</span>
          <EyeOff size={14} />
        </div>
      </div>
      <div className="p-4 md:p-5 bg-white/40">
        {/* We use a new instance of MarkdownRenderer (essentially) to render the inner content */}
        <ReactMarkdown
          remarkPlugins={remarkPlugins as any}
          rehypePlugins={rehypePlugins as any}
          components={{
             // Simplified components for inner content to prevent deep nesting issues, 
             // but keeping math and basic formatting
             h1: ({node, ...props}) => <h4 className="font-bold my-2 text-gray-900" {...props} />,
             h2: ({node, ...props}) => <h5 className="font-bold my-2 text-gray-900" {...props} />,
             p: ({node, ...props}) => <p className="mb-2 last:mb-0 text-gray-700 leading-7 text-sm" {...props} />,
             strong: ({node, ...props}) => <strong className="font-bold text-amber-800 bg-amber-100/50 px-1 rounded" {...props} />,
             ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 my-2 space-y-1 text-gray-700 text-sm" {...props} />,
             ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 my-2 space-y-1 text-gray-700 text-sm" {...props} />,
             table: ({node, ...props}) => (
                <div className="overflow-x-auto my-2 rounded border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-xs" {...props} />
                </div>
              ),
              th: ({node, ...props}) => <th className="px-2 py-1 text-left font-semibold text-gray-600 bg-gray-50" {...props} />,
              td: ({node, ...props}) => <td className="px-2 py-1 text-gray-700 border-t border-gray-100" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose prose-blue prose-sm max-w-none dark:prose-invert leading-relaxed text-gray-800">
      <ReactMarkdown
        remarkPlugins={remarkPlugins as any}
        rehypePlugins={rehypePlugins as any}
        components={{
          h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3 text-blue-900 border-b pb-1" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2 text-blue-800" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-md font-semibold my-2 text-blue-700" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded-md mx-0.5 text-[0.95em]" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 my-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 my-2 space-y-1" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-2 bg-gray-50 italic text-gray-600" {...props} />,
          
          // Enhanced Pre handling
          pre: ({node, ...props}) => {
            const codeNode = node?.children?.find((child: any) => child.tagName === 'code') as any;
            const className = codeNode?.properties?.className || [];
            
            // Check for custom block types
            const isSvg = Array.isArray(className) ? className.includes('language-svg') : typeof className === 'string' && className.includes('language-svg');
            const isAnalysis = Array.isArray(className) ? className.includes('language-analysis') : typeof className === 'string' && className.includes('language-analysis');

            if (isSvg || isAnalysis) {
               return <>{props.children}</>;
            }

            return (
              <div className="bg-gray-900 rounded-lg p-3 my-3 overflow-x-auto shadow-sm border border-gray-800">
                <pre className="font-mono text-sm text-gray-100" {...props} />
              </div>
            );
          },

          // Enhanced Code handling
          code: ({node, className, children, ...props}) => {
             const match = /language-(\w+)/.exec(className || '');
             const lang = match ? match[1] : '';

             if (lang === 'analysis') {
                const analysisContent = String(children).replace(/\n$/, '');
                return <AnalysisPanel content={analysisContent} />;
             }

             if (lang === 'svg') {
                const svgString = String(children).replace(/\n$/, '');
                // Try to extract title for tooltip, case insensitive match
                const titleMatch = svgString.match(/<title.*?>(.*?)<\/title>/i);
                const description = titleMatch ? titleMatch[1] : 'AI 生成的图形推理演示';

                return (
                  <div className="relative group my-4 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-white">
                    <div 
                      className="p-4 flex justify-center items-center shadow-sm"
                      dangerouslySetInnerHTML={{ __html: svgString }}
                    />
                    
                    <div className="absolute top-2 right-2 transition-opacity duration-200">
                       <div className="group/tooltip relative">
                          <div className="bg-blue-50/80 backdrop-blur-sm text-blue-600 p-1.5 rounded-full cursor-help hover:bg-blue-100 border border-blue-100 shadow-sm">
                             <Info size={16} />
                          </div>
                          <div className="absolute right-0 top-full mt-2 w-48 p-2 bg-gray-900/95 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10 pointer-events-none text-center backdrop-blur">
                             {description}
                             <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900/95 rotate-45"></div>
                          </div>
                       </div>
                    </div>
                  </div>
                );
             }

             const isInline = !className; 
             return isInline 
               ? <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-pink-600 border border-gray-200" {...props}>{children}</code>
               : <code className={`${className} font-mono text-sm`} {...props}>{children}</code>;
          },

          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
          
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-3 rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm" {...props} />
            </div>
          ),
          thead: ({node, ...props}) => <thead className="bg-gray-50" {...props} />,
          tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-200" {...props} />,
          tr: ({node, ...props}) => <tr className="hover:bg-gray-50 transition-colors" {...props} />,
          th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap bg-gray-100" {...props} />,
          td: ({node, ...props}) => <td className="px-3 py-2 text-gray-700 whitespace-nowrap tabular-nums" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;