import { useEffect, useRef, useState, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

type Props<T extends string> = {
  value: T;
  onChange: (next: T) => void;
  options: readonly T[];
  className?: string;
  placeholder?: string;
};

export function CustomSelect<T extends string>({
  value,
  onChange,
  options,
  className,
  placeholder,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      setOpen(true);
      e.preventDefault();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className={`relative ${open ? "z-50" : "z-10"} ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className="glass-input w-full rounded-xl px-4 py-3 text-sm text-foreground flex items-center justify-between transition-colors focus:outline-none text-left"
      >
        <span className={!value ? "text-muted-foreground/70" : "truncate pr-2"}>
          {value || placeholder || "Pilih opsi..."}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground/70 transition-transform duration-200 flex-shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full dropdown-solid rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul
            id={listboxId}
            role="listbox"
            className="max-h-60 overflow-y-auto py-1.5"
          >
            {options.map((opt) => {
              const active = opt === value;
              return (
                <li
                  key={opt}
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={[
                    "px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between",
                    active
                      ? "bg-primary/10 text-foreground font-medium"
                      : "text-foreground/85 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span className="truncate pr-2">{opt}</span>
                  {active && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
