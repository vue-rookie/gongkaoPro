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

// Separate plugins
const remarkPlugins = [remarkMath, remarkGfm];
const rehypePlugins = [rehypeRaw, [rehypeKatex, { strict: false, throwOnError: false }]];

// --- Sub-components ---

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
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
};

const SvgBlock = ({ content }: { content: string }) => {
  const titleMatch = content.match(/<title.*?>(.*?)<\/title>/i);
  const description = titleMatch ? titleMatch[1] : 'AI 生成的图形推理演示';
  
  let cleanSvg = content.replace(/^svg/i, '').trim();
  
  if (!cleanSvg.startsWith('<svg') && cleanSvg.includes('<path')) {
     cleanSvg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="black" fill="none">${cleanSvg}</svg>`;
  }

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-white">
      <div 
        className="p-4 flex justify-center items-center shadow-sm"
        dangerouslySetInnerHTML={{ __html: cleanSvg }}
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
};

// --- Custom Component Maps ---

const CustomPre = ({ node, children, ...props }: any) => {
    // Attempt to extract the language from the child <code> element
    const codeNode = node?.children?.find((child: any) => child.tagName === 'code');
    const className = codeNode?.properties?.className || [];
    const rawContent = codeNode?.children?.[0]?.value || '';
    const contentStr = String(rawContent).trim();

    const isSvgLang = Array.isArray(className) ? className.includes('language-svg') : (typeof className === 'string' && className.includes('language-svg'));
    const isAnalysis = Array.isArray(className) ? className.includes('language-analysis') : (typeof className === 'string' && className.includes('language-analysis'));
    const looksLikeSvg = contentStr.startsWith('<svg') || contentStr.startsWith('```svg') || contentStr.includes('xmlns="http://www.w3.org/2000/svg"');

    if (isSvgLang || isAnalysis || looksLikeSvg) {
        // Render children directly so the `code` component can handle it
        return <>{children}</>;
    }

    return (
        <div className="bg-gray-900 rounded-lg p-3 my-3 overflow-x-auto shadow-sm border border-gray-800">
            <pre className="font-mono text-sm text-gray-100" {...props}>{children}</pre>
        </div>
    );
};

const CustomCode = ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    let lang = match ? match[1] : '';
    const content = String(children).replace(/\n$/, '').trim();

    if (content.startsWith('<svg') && content.endsWith('</svg>')) {
        lang = 'svg';
    }

    if (lang === 'analysis') {
        return <AnalysisPanel content={content} />;
    }

    if (lang === 'svg') {
        return <SvgBlock content={content} />;
    }

    if (!className && content.startsWith('<svg')) {
        return <SvgBlock content={content} />;
    }

    const isInline = !className;
    if (isInline) {
        return <code className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono text-pink-600 border border-gray-200" {...props}>{children}</code>;
    }

    return <code className={`${className} font-mono text-sm`} {...props}>{children}</code>;
};

// Define components object
const MARKDOWN_COMPONENTS = {
    h1: ({node, ...props}: any) => <h4 className="font-bold my-2 text-gray-900" {...props} />,
    h2: ({node, ...props}: any) => <h5 className="font-bold my-2 text-gray-900" {...props} />,
    h3: ({node, ...props}: any) => <h6 className="font-bold my-2 text-gray-800" {...props} />,
    p: ({node, ...props}: any) => <p className="mb-2 last:mb-0 text-gray-700 leading-7 text-sm" {...props} />,
    strong: ({node, ...props}: any) => <strong className="font-bold text-amber-800 bg-amber-100/50 px-1 rounded" {...props} />,
    ul: ({node, ...props}: any) => <ul className="list-disc list-outside ml-4 my-2 space-y-1 text-gray-700 text-sm" {...props} />,
    ol: ({node, ...props}: any) => <ol className="list-decimal list-outside ml-4 my-2 space-y-1 text-gray-700 text-sm" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-2 bg-gray-50 italic text-gray-600" {...props} />,
    table: ({node, ...props}: any) => (
        <div className="overflow-x-auto my-2 rounded border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-xs" {...props} />
        </div>
    ),
    th: ({node, ...props}: any) => <th className="px-2 py-1 text-left font-semibold text-gray-600 bg-gray-50" {...props} />,
    td: ({node, ...props}: any) => <td className="px-2 py-1 text-gray-700 border-t border-gray-100" {...props} />,
    pre: CustomPre,
    code: CustomCode
};

// --- Main Component ---

const MarkdownRenderer: React.FC<Props> = ({ content, className }) => {
  const finalClass = className 
    ? `prose prose-blue max-w-none dark:prose-invert leading-relaxed text-gray-800 ${className}`
    : `prose prose-blue prose-sm max-w-none dark:prose-invert leading-relaxed text-gray-800`;

  return (
    <div className={finalClass}>
      <ReactMarkdown
        remarkPlugins={remarkPlugins as any}
        rehypePlugins={rehypePlugins as any}
        components={MARKDOWN_COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;