import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="a-label" htmlFor={htmlFor}>
        {label}
        {required && <span style={{ color: "var(--orange)" }}> *</span>}
      </label>
      {children}
      {error ? (
        <p className="a-error-text" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="a-hint">{hint}</p>
      ) : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className="relative h-6 w-11 flex-none rounded-full transition-colors"
        style={{ background: checked ? "var(--green)" : "#d6d6cc" }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all"
          style={{ left: checked ? 22 : 2 }}
        />
      </button>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {hint && (
          <span className="block text-xs" style={{ color: "var(--admin-ink-soft)" }}>
            {hint}
          </span>
        )}
      </span>
    </label>
  );
}
