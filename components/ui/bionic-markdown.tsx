'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAccessibility } from '@/components/providers/accessibility-provider';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

function processString(text: string) {
  return text.split(/(\s+)/).map((word, idx) => {
    if (word.trim().length <= 1) return <React.Fragment key={idx}>{word}</React.Fragment>;
    const mid = Math.ceil(word.length * 0.4);
    const start = word.slice(0, mid);
    const end = word.slice(mid);
    return (
      <React.Fragment key={idx}>
        <strong className="font-extrabold">{start}</strong>{end}
      </React.Fragment>
    );
  });
}

function renderChildren(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, child => {
    if (typeof child === 'string') {
      return processString(child);
    }
    if (React.isValidElement(child)) {
      const props = child.props as Record<string, any>;
      return React.cloneElement(child, {
        ...props,
        children: renderChildren(props.children)
      } as any);
    }
    return child;
  });
}

export function BionicMarkdown({ content }: { content: string }) {
  const { bionicReading } = useAccessibility();

  if (!bionicReading) {
    return <ReactMarkdown>{content}</ReactMarkdown>;
  }

  const components = {
    p: ({node, children, ...props}: any) => <p {...props}>{renderChildren(children)}</p>,
    span: ({node, children, ...props}: any) => <span {...props}>{renderChildren(children)}</span>,
    li: ({node, children, ...props}: any) => <li {...props}>{renderChildren(children)}</li>,
    h1: ({node, children, ...props}: any) => <h1 {...props}>{renderChildren(children)}</h1>,
    h2: ({node, children, ...props}: any) => <h2 {...props}>{renderChildren(children)}</h2>,
    h3: ({node, children, ...props}: any) => <h3 {...props}>{renderChildren(children)}</h3>,
    h4: ({node, children, ...props}: any) => <h4 {...props}>{renderChildren(children)}</h4>,
    a: ({node, children, ...props}: any) => <a {...props}>{renderChildren(children)}</a>,
  };

  return (
    <ReactMarkdown components={components}>
      {content}
    </ReactMarkdown>
  );
}
