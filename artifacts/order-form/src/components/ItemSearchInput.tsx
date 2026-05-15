import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, Check, Pencil } from "lucide-react";
import { ITEM_LIST } from "@/data/items";

type Props = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
};

const MAX_RESULTS = 8;

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function scoreMatch(item: string, q: string): number {
  if (!q) return 0;
  const a = normalize(item);
  const b = normalize(q);
  if (a === b) return 1000;
  if (a.startsWith(b)) return 500 - (a.length - b.length);
  // Word-start match
  const words = a.split(/[\s\-/().]+/).filter(Boolean);
  if (words.some((w) => w.startsWith(b))) return 400 - (a.length - b.length);
  const idx = a.indexOf(b);
  if (idx >= 0) return 200 - idx - (a.length - b.length) * 0.1;
  // Subsequence match (typo tolerant)
  let i = 0;
  for (const ch of a) {
    if (ch === b[i]) i++;
    if (i === b.length) break;
  }
  if (i === b.length) return 50 - (a.length - b.length) * 0.05;
  return -1;
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const a = text.toLowerCase();
  const b = q.toLowerCase().trim();
  const idx = a.indexOf(b);
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/15 text-primary rounded px-0.5">
        {text.slice(idx, idx + b.length)}
      </mark>
      {text.slice(idx + b.length)}
    </>
  );
}

export function ItemSearchInput({
  value,
  onChange,
  placeholder,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Keep internal query in sync if value changes externally
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q) {
      // Show first 8 alphabetically when empty
      return ITEM_LIST.slice(0, MAX_RESULTS);
    }
    return ITEM_LIST.map((item) => ({ item, score: scoreMatch(item, q) }))
      .filter((r) => r.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((r) => r.item);
  }, [query]);

  const isInList = useMemo(
    () =>
      query.trim().length > 0 &&
      ITEM_LIST.some(
        (i) => normalize(i) === normalize(query),
      ),
    [query],
  );

  useEffect(() => {
    setActiveIdx(0);
  }, [query, open]);

  const commit = (next: string) => {
    onChange(next);
    setQuery(next);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && matches[activeIdx]) {
        e.preventDefault();
        commit(matches[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showCustomHint =
    query.trim().length > 0 && !isInList && matches.length === 0;

  return (
    <div ref={wrapRef} className={`relative ${open ? "z-50" : "z-10"} ${className ?? ""}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? "Cari nama barang..."}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="glass-input w-full rounded-xl pl-10 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground/70"
          autoComplete="off"
        />
        {query.trim().length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {isInList ? (
              <span
                title="Cocok dengan daftar"
                className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600"
              >
                <Check className="h-3 w-3" />
              </span>
            ) : (
              <span
                title="Diisi manual"
                className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-amber-500/15 text-amber-600"
              >
                <Pencil className="h-3 w-3" />
              </span>
            )}
          </div>
        )}
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full dropdown-solid rounded-2xl overflow-hidden">
          {matches.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-72 overflow-y-auto py-1.5"
            >
              {matches.map((m, i) => {
                const active = i === activeIdx;
                return (
                  <li
                    key={m}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIdx(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commit(m);
                    }}
                    className={[
                      "px-3.5 py-2 text-sm cursor-pointer transition-colors",
                      active
                        ? "bg-primary/10 text-foreground"
                        : "text-foreground/85 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {highlight(m, query)}
                  </li>
                );
              })}
            </ul>
          ) : showCustomHint ? (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              Tidak ada di daftar. Tetap akan menggunakan{" "}
              <span className="font-semibold text-foreground/80">
                "{query.trim()}"
              </span>{" "}
              sebagai input manual.
            </div>
          ) : (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              Ketik untuk mencari…
            </div>
          )}
          <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50 text-[11px] text-muted-foreground flex items-center justify-between gap-2">
            <span>↑↓ pilih · Enter konfirmasi</span>
            <span>Atau ketik nama lain bebas</span>
          </div>
        </div>
      )}
    </div>
  );
}
