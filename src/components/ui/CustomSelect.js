"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const buttonBase =
  "w-full flex items-center justify-between gap-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/30";

const variants = {
  default:
    "px-3 py-2.5 border-sky-300 dark:border-slate-600 bg-sky-50 dark:bg-slate-800 text-sky-900 dark:text-sky-100 text-sm font-medium hover:border-sky-400",
  field:
    "px-3 py-2.5 border-sky-300 dark:border-slate-600 bg-sky-50 dark:bg-slate-800 text-sky-900 dark:text-sky-100 text-sm font-medium hover:border-sky-400",
  bare: "px-1.5 py-1 pr-6 bg-transparent border-transparent text-sky-700 dark:text-sky-300 text-sm font-medium hover:bg-sky-50 dark:hover:bg-slate-700/60 hover:border-transparent",
};

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  variant = "default",
  className = "",
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const items = options.map((o) =>
    typeof o === "object" ? o : { value: o, label: o }
  );
  const selected = items.find((o) => o.value === value);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((v) => !v)}
        className={`${buttonBase} ${variants[variant] || variants.default}`}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-sky-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="dropdown-pop absolute z-50 mt-1.5 w-full max-h-60 overflow-auto rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-lg shadow-sky-900/10 py-1"
        >
          {items.map((o) => {
            const active = o.value === value;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer transition-colors ${
                  active
                    ? "bg-sky-500 text-white"
                    : "text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-slate-700"
                }`}
              >
                <span className="truncate">{o.label}</span>
                {active && <Check className="w-4 h-4 shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
