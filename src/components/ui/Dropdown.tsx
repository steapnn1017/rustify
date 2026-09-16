"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

export function Dropdown({
  label,
  icon,
  valueLabel,
  children,
  align = "left",
  className = "",
  buttonClassName = "filter",
}: {
  label: string;
  icon?: ReactNode;
  valueLabel?: string;
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
  className?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close();
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div className={`dd ${className}`} ref={rootRef}>
      <button
        type="button"
        className={`${buttonClassName}${open ? " is-on" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        <span>{valueLabel || label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open ? (
        <div
          id={menuId}
          className={`dd__menu${align === "right" ? " dd__menu--right" : ""}`}
          role="menu"
          aria-label={label}
        >
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownItem({
  active,
  onSelect,
  children,
}: {
  active?: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      className={active ? "dd__item is-active" : "dd__item"}
      onClick={onSelect}
    >
      {children}
    </button>
  );
}
