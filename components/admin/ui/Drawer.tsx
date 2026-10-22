"use client";

import { useEffect, type ReactNode } from "react";
import { Icon } from "./icons";

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
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
    <>
      <div className="a-drawer-backdrop" onClick={onClose} />
      <aside className="a-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--admin-line)" }}>
          <h2 className="admin-title text-lg font-bold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="a-btn a-btn-ghost a-btn-sm" style={{ padding: "0.4rem" }}>
            <Icon name="x" size={18} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <footer className="border-t px-5 py-4" style={{ borderColor: "var(--admin-line)" }}>
            {footer}
          </footer>
        )}
      </aside>
    </>
  );
}
