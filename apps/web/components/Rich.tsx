import katex from "katex";
import { Fragment, type ReactNode } from "react";

/**
 * KaTeX rendering. Output includes MathML for screen readers. `trust: false` blocks
 * \href, \url and other commands that could inject links or HTML.
 */
export function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = katex.renderToString(tex, { displayMode: display, throwOnError: false, trust: false, strict: "ignore", output: "htmlAndMathml", maxSize: 50, maxExpand: 500 });
  const Tag = display ? "div" : "span";
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Inline formatting: $$display$$, $inline$, **bold**, `code`. Everything else is plain text (never HTML). */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\$\$[^$]+\$\$|\$[^$\n]+\$|\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith("$$")) out.push(<Tex key={k} tex={tok.slice(2, -2)} display />);
    else if (tok.startsWith("$")) out.push(<Tex key={k} tex={tok.slice(1, -1)} />);
    else if (tok.startsWith("**")) out.push(<strong key={k} className="font-semibold text-fg">{inline(tok.slice(2, -2), k)}</strong>);
    else out.push(<code key={k} className="rounded bg-card-2 px-1 py-0.5 font-mono text-[0.9em]">{tok.slice(1, -1)}</code>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Block formatting: paragraphs (blank-line separated), hard breaks ("  \n"), "- " bullet and "1. " numbered lists. */
export function Rich({ md, className }: { md: string; className?: string }) {
  const paras = md.split(/\n\s*\n/);
  return (
    <div className={className}>
      {paras.map((p, pi) => {
        const lines = p.split(/ {2}\n|\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length > 0 && lines.every((l) => /^- /.test(l))) {
          return (
            <ul key={pi} className="my-2 list-disc space-y-1 pl-6">
              {lines.map((l, li) => <li key={li}>{inline(l.slice(2), `${pi}-${li}`)}</li>)}
            </ul>
          );
        }
        if (lines.length > 0 && lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={pi} className="my-2 list-decimal space-y-1 pl-6">
              {lines.map((l, li) => <li key={li}>{inline(l.replace(/^\d+\. /, ""), `${pi}-${li}`)}</li>)}
            </ol>
          );
        }
        return (
          <p key={pi} className="my-2 first:mt-0 last:mb-0">
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l, `${pi}-${li}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
