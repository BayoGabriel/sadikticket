"use client";

import { Icon } from "@/components/admin/ui/icons";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => window.print()}>
      <Icon name="printer" size={14} /> {label}
    </button>
  );
}
