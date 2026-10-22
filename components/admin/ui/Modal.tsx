"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./icons";

export function Modal({
  open,
  onClose,
  title,
  children,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="a-drawer-backdrop" onClick={onClose} style={{ zIndex: 90 }}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="a-card absolute left-1/2 top-1/2 w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 p-5"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="admin-title text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="a-btn a-btn-ghost a-btn-sm" style={{ padding: "0.4rem" }}>
            <Icon name="x" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Destructive confirm — for deletes the user must type the name.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Delete",
  requireText,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  requireText?: string;
  loading?: boolean;
}) {
  const [typed, setTyped] = useState("");
  useEffect(() => {
    if (open) setTyped("");
  }, [open]);
  const ok = !requireText || typed.trim() === requireText;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="text-sm" style={{ color: "var(--admin-ink-soft)" }}>
        {body}
      </div>
      {requireText && (
        <div className="mt-4">
          <label className="a-label" htmlFor="confirm-type">
            Type <strong>{requireText}</strong> to confirm
          </label>
          <input
            id="confirm-type"
            className="a-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
          />
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" className="a-btn a-btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="a-btn a-btn-danger"
          disabled={!ok || loading}
          onClick={onConfirm}
        >
          {loading ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
