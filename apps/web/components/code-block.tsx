"use client";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/github-dark.css";

hljs.registerLanguage("javascript", javascript);

type Props = {
  code: string;
  language?: string;
};

export function CodeBlock({ code, language = "javascript" }: Props) {
  const html =
    language === "javascript"
      ? hljs.highlight(code, { language: "javascript" }).value
      : hljs.highlightAuto(code).value;

  return (
    <pre
      data-testid="code-block"
      className="overflow-x-auto rounded-lg border border-border bg-slate-950 p-4 text-sm"
    >
      <code
        className="hljs"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </pre>
  );
}
