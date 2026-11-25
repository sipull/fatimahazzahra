"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   Editor teks kaya ringan berbasis teks biasa berformat.
   Mendukung: paragraf, judul (##), daftar bernomor (1. ),
   daftar poin (- ), dan tebal (**teks**).
   Disimpan sebagai teks → dirender RichText di halaman publik.
   ============================================================ */

export const RICH_HELP =
  "Gunakan **teks tebal**, baris pertama ## untuk judul, “- ” untuk daftar poin, “1. ” untuk daftar bernomor, dan baris kosong untuk paragraf baru.";

function wrap(selStart: number, selEnd: number, text: string, before: string, after: string) {
  const inner = text.slice(selStart, selEnd) || "teks";
  return {
    value: `${text.slice(0, selStart)}${before}${inner}${after}${text.slice(selEnd)}`,
    caret: selStart + before.length + inner.length + after.length,
  };
}

function prefixLines(text: string, selStart: number, selEnd: number, prefix: string, numbered = false) {
  const start = text.lastIndexOf("\n", selStart - 1) + 1;
  const endIdx = text.indexOf("\n", selEnd);
  const end = endIdx === -1 ? text.length : endIdx;
  const block = text.slice(start, end);
  const lines = block.split("\n");
  const allHave = lines.every((l) => l.trim() === "" || l.trimStart().startsWith(prefix.replace(/\d+\.\s$/, "")) || /^\d+\.\s/.test(l.trimStart()));
  const out = lines
    .map((l, i) => {
      const stripped = l.replace(/^[-*]\s+|^\d+\.\s+|^(##|###)\s+/, "");
      if (allHave && l.trim() !== "") return stripped;
      return numbered ? `${i + 1}. ${stripped}` : `${prefix}${stripped}`;
    })
    .join("\n");
  return {
    value: `${text.slice(0, start)}${out}${text.slice(end)}`,
    caret: start + out.length,
  };
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  rows = 10,
  required,
  help,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  required?: boolean;
  help?: string;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [sel, setSel] = useState({ start: 0, end: 0 });

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    const onUp = () => setSel({ start: ta.selectionStart, end: ta.selectionEnd });
    ta.addEventListener("keyup", onUp);
    ta.addEventListener("mouseup", onUp);
    return () => {
      ta.removeEventListener("keyup", onUp);
      ta.removeEventListener("mouseup", onUp);
    };
  }, []);

  function apply(fn: (s: number, e: number, t: string) => { value: string; caret: number }) {
    const ta = ref.current;
    const start = ta?.selectionStart ?? sel.start;
    const end = ta?.selectionEnd ?? sel.end;
    const res = fn(start, end, value);
    onChange(res.value);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (el) {
        el.focus();
        el.setSelectionRange(res.caret, res.caret);
      }
    });
  }

  const btn = "border border-cocoa-300 bg-paper px-2.5 py-1.5 text-[11px] font-bold text-cocoa-600 hover:border-terra-400 hover:text-terra-600";

  return (
    <div className="grid gap-1.5">
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-bold text-cocoa-700">
          {label} {required && <span className="text-terra-500">*</span>}
        </span>
        <button type="button" onClick={() => setShowHelp((v) => !v)} className="text-[11px] font-semibold text-cocoa-400 underline hover:text-terra-600">
          {showHelp ? "sembunyikan panduan" : "panduan format"}
        </button>
      </span>

      <div className="flex flex-wrap items-center gap-1 border border-b-0 border-cocoa-300 bg-sand-100 px-2 py-2">
        <button type="button" className={`${btn} font-serif-display`} title="Teks tebal" onClick={() => apply((s, e, t) => wrap(s, e, t, "**", "**"))}>
          B
        </button>
        <button type="button" className={`${btn} font-serif-display`} title="Judul bagian" onClick={() => apply((s, e, t) => prefixLines(t.slice(0, 0) || t, s, e, "## "))}>
          H
        </button>
        <span className="mx-1 h-5 w-px bg-cocoa-200" aria-hidden />
        <button type="button" className={btn} title="Daftar poin" onClick={() => apply((s, e, t) => prefixLines(t, s, e, "- "))}>
          • Poin
        </button>
        <button type="button" className={btn} title="Daftar bernomor" onClick={() => apply((s, e, t) => prefixLines(t, s, e, "1. ", true))}>
          1. Nomor
        </button>
        <span className="mx-1 h-5 w-px bg-cocoa-200" aria-hidden />
        <button type="button" className={btn} title="Butir bernomor dengan judul tebal" onClick={() => apply((s, e, t) => wrap(s, e, t, "**1. ", "**\n"))}>
          Butir+Judul
        </button>
        <span className="label-caps ml-auto text-cocoa-400">{value.length} karakter</span>
      </div>

      <textarea
        ref={ref}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-cocoa-300 bg-paper px-4 py-3 font-mono text-[13px] leading-relaxed text-cocoa-700 placeholder:text-cocoa-300 focus:border-terra-400"
        style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
      />

      {showHelp && (
        <p className="border border-dashed border-kraft-300 bg-kraft-100 px-3 py-2 text-xs leading-relaxed text-cocoa-500">{RICH_HELP}</p>
      )}
      {help && !showHelp && <span className="text-xs text-cocoa-400">{help}</span>}

      {value.trim() && (
        <details className="border border-dashed border-kraft-300 bg-sand-100/70 px-3 py-2">
          <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-widest text-cocoa-500">Pratinjau format</summary>
          <div className="prose-portofolio mt-2 text-sm">
            {value
              .split(/\n{2,}/)
              .filter((b) => b.trim())
              .map((b, i) => {
                const lines = b.split("\n").filter((l) => l.trim());
                if (lines[0]?.startsWith("## ")) return <h4 key={i} className="font-serif-display text-base font-bold text-cocoa-700">{lines[0].slice(3)}</h4>;
                if (lines.every((l) => /^\d+\.\s/.test(l.trim())))
                  return (
                    <ol key={i} className="my-2 grid gap-1">
                      {lines.map((l, j) => <li key={j} className="text-[13px] text-cocoa-600">{l.replace(/^\d+\.\s/, "").replace(/\*\*/g, "")}</li>)}
                    </ol>
                  );
                if (lines.every((l) => /^[-*]\s/.test(l.trim())))
                  return (
                    <ul key={i} className="my-2 grid gap-1">
                      {lines.map((l, j) => <li key={j} className="text-[13px] text-cocoa-600">• {l.replace(/^[-*]\s/, "").replace(/\*\*/g, "")}</li>)}
                    </ul>
                  );
                return <p key={i} className="text-[13px] text-cocoa-600">{b.replace(/\*\*/g, "")}</p>;
              })}
          </div>
        </details>
      )}
    </div>
  );
}
