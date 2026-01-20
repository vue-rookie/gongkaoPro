import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GongKao Pro - 公考智囊',
  description: 'An advanced AI assistant for Chinese Civil Service Exams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossOrigin="anonymous" />
        <style dangerouslySetInnerHTML={{__html: `
          body { font-family: 'Noto Sans SC', sans-serif; background-color: #f3f4f6; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}