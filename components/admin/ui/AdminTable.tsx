"use client";

import type { ReactNode } from "react";

// Responsive table: a real <table> on desktop, stacked cards on phones.
// `renderCard(row)` produces the mobile card body for each row.
export function AdminTable<T extends { id: string }>({
  columns,
  rows,
  renderCard,
  onRowClick,
  rowKey,
}: {
  columns: { label: string; render: (row: T) => ReactNode; className?: string }[];
  rows: T[];
  renderCard?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T) => string;
}) {
  return (
    <>
      {/* Desktop table */}
      <div className="a-card hidden overflow-x-auto md:block">
        <table className="a-table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} className={c.className}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey ? rowKey(row) : row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: "pointer" } : undefined}
              >
                {columns.map((c, i) => (
                  <td key={i} className={c.className}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div
            key={rowKey ? rowKey(row) : row.id}
            className="a-card p-4"
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            style={onRowClick ? { cursor: "pointer" } : undefined}
          >
            {renderCard ? renderCard(row) : columns[0]?.render(row)}
          </div>
        ))}
      </div>
    </>
  );
}

export function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-sm">
      <button
        type="button"
        className="a-btn a-btn-ghost a-btn-sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        ← Newer
      </button>
      <span style={{ color: "var(--admin-ink-soft)" }}>
        Page {page} of {pages}
      </span>
      <button
        type="button"
        className="a-btn a-btn-ghost a-btn-sm"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Older →
      </button>
    </div>
  );
}
