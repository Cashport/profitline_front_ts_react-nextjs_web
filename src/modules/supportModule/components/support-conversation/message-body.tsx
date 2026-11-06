"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Check, Copy } from "lucide-react";

const SQL_KEYWORDS =
  /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|IS|NULL|AS|ON|JOIN|LEFT|RIGHT|INNER|OUTER|GROUP|BY|ORDER|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|DISTINCT|COUNT|SUM|MIN|MAX|AVG|CASE|WHEN|THEN|ELSE|END|UNION|ALL|EXISTS|BETWEEN|LIKE|DESC|ASC|BEGIN|COMMIT|ROLLBACK|TRANSACTION|WITH)\b/gi;

type Token = { text: string; kind: "kw" | "str" | "num" | "comment" | "plain" };

/** Resaltado mínimo de SQL: palabras clave, textos, números y comentarios. */
function tokenizeSql(code: string): Token[] {
  const tokens: Token[] = [];
  const re = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*')|(\b\d+(?:\.\d+)?\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const pushPlain = (text: string) => {
    let i = 0;
    text.replace(SQL_KEYWORDS, (kw, offset: number) => {
      if (offset > i) tokens.push({ text: text.slice(i, offset), kind: "plain" });
      tokens.push({ text: kw, kind: "kw" });
      i = offset + kw.length;
      return kw;
    });
    if (i < text.length) tokens.push({ text: text.slice(i), kind: "plain" });
  };
  while ((m = re.exec(code))) {
    if (m.index > last) pushPlain(code.slice(last, m.index));
    tokens.push({ text: m[0], kind: m[1] ? "comment" : m[2] ? "str" : "num" });
    last = m.index + m[0].length;
  }
  if (last < code.length) pushPlain(code.slice(last));
  return tokens;
}

const TOKEN_CLASS: Record<Token["kind"], string> = {
  kw: "text-[#7b3fe4] font-semibold",
  str: "text-[#0e9aa7]",
  num: "text-[#ff6a13]",
  comment: "text-cp-ink-4 italic",
  plain: ""
};

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const isSql = /^(sql|mysql)$/i.test(language) || (!language && SQL_KEYWORDS.test(code));
  SQL_KEYWORDS.lastIndex = 0;
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-cp-line bg-cp-bg">
      <div className="flex h-8 items-center justify-between border-b border-cp-line px-3 text-[13px] text-cp-ink-3">
        <span>{isSql ? "SQL" : language || "Código"}</span>
        <button
          type="button"
          onClick={copy}
          className="flex cursor-pointer items-center gap-1 border-0 bg-transparent text-[13px] font-medium text-cp-ink-3 hover:text-cp-ink"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="m-0 max-h-[360px] overflow-auto whitespace-pre p-3 font-mono text-[13px] leading-relaxed">
        {isSql
          ? tokenizeSql(code).map((t, i) => (
              <span key={i} className={TOKEN_CLASS[t.kind]}>
                {t.text}
              </span>
            ))
          : code}
      </pre>
    </div>
  );
}

/** Cuerpo de un mensaje: markdown con bloques de código (SQL resaltado y botón copiar). */
export default function MessageBody({ text }: { text: string }) {
  return (
    <div className="support-md min-w-0 break-words text-[13px] leading-relaxed text-cp-ink">
      <ReactMarkdown
        components={{
          code({ className, children }) {
            const language = /language-(\w+)/.exec(className || "")?.[1] ?? "";
            const raw = String(children).replace(/\n$/, "");
            if (!className && !raw.includes("\n")) {
              return (
                <code className="rounded bg-cp-muted px-1 py-0.5 font-mono text-[13px]">{raw}</code>
              );
            }
            return <CodeBlock code={raw} language={language} />;
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
          p: ({ children }) => <p className="my-1 whitespace-pre-line">{children}</p>,
          ul: ({ children }) => <ul className="my-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="my-1 pl-5">{children}</ol>
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
