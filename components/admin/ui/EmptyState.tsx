import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function EmptyState({
  icon = "sparkles",
  title,
  body,
  actionLabel,
  actionHref,
  onAction,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}) {
  const action: ReactNode =
    actionLabel && actionHref ? (
      <Link href={actionHref} className="a-btn a-btn-orange mt-4">
        {actionLabel}
      </Link>
    ) : actionLabel && onAction ? (
      <button type="button" onClick={onAction} className="a-btn a-btn-orange mt-4">
        {actionLabel}
      </button>
    ) : null;

  return (
    <div className="a-card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--peach-2)", color: "var(--orange)" }}
      >
        <Icon name={icon} size={26} />
      </div>
      <h3 className="admin-title text-lg font-bold">{title}</h3>
      {body && (
        <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--admin-ink-soft)" }}>
          {body}
        </p>
      )}
      {action}
    </div>
  );
}
