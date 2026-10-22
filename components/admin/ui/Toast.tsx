"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type Toast = {
  id: number;
  message: string;
  kind: "ok" | "error";
  actionLabel?: string;
  onAction?: () => void;
};

type ToastCtx = {
  toast: (message: string, opts?: { error?: boolean; actionLabel?: string; onAction?: () => void }) => void;
};

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback(
    (message: string, opts?: { error?: boolean; actionLabel?: string; onAction?: () => void }) => {
      const id = ++idRef.current;
      setToasts((t) => [...t, { id, message, kind: opts?.error ? "error" : "ok", actionLabel: opts?.actionLabel, onAction: opts?.onAction }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5000);
    },
    [],
  );

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="a-toast-wrap" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`a-toast ${t.kind === "error" ? "error" : ""}`}>
            <span className="flex-1">{t.message}</span>
            {t.actionLabel && (
              <button
                type="button"
                onClick={() => {
                  t.onAction?.();
                  setToasts((x) => x.filter((y) => y.id !== t.id));
                }}
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
