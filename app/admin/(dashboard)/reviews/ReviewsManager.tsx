"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type ReviewRow = {
  id: string;
  name: string;
  context: string;
  kind: "guest" | "client";
  text: string;
  approved: boolean;
};

const inputCls =
  "w-full rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600";

export function ReviewsManager({ initial }: { initial: ReviewRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message);
      setItems((xs) =>
        xs.map((x) => (x.id === id ? { ...x, ...body } : x)) as ReviewRow[],
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    setBusy(id);
    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message);
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  };

  const create = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/v1/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          context: fd.get("context") || undefined,
          kind: fd.get("kind") || "guest",
          text: fd.get("text"),
          approved: fd.get("approved") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message);
      setAdding(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    }
  };

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={() => setAdding((v) => !v)}
        className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-700"
      >
        {adding ? "Close" : "Add a review"}
      </button>

      {adding && (
        <form
          onSubmit={create}
          className="space-y-3 rounded-2xl border border-[#E8E8E5] bg-white p-5"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <input name="name" required placeholder="Name (e.g. Ada)" className={inputCls} />
            <input
              name="context"
              placeholder="Context (e.g. Sip and Paint, Lagos)"
              className={inputCls}
            />
            <select name="kind" className={inputCls} defaultValue="guest">
              <option value="guest">Guest</option>
              <option value="client">Client</option>
            </select>
          </div>
          <textarea
            name="text"
            required
            rows={3}
            placeholder="Their own words…"
            className={inputCls}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="approved" defaultChecked /> Approved
          </label>
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            Save review
          </button>
        </form>
      )}

      <div className="space-y-3">
        {items.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-[#E8E8E5] bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">
                  {r.name}
                  {r.context && (
                    <span className="ml-2 text-sm text-[#6B6B6B]">
                      {r.context}
                    </span>
                  )}
                  <span className="ml-2 rounded-full bg-[#F3F3F0] px-2 py-0.5 text-xs text-[#6B6B6B]">
                    {r.kind}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#444]">{r.text}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  disabled={busy === r.id}
                  onClick={() => patch(r.id, { approved: !r.approved })}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                    r.approved
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                  }`}
                >
                  {r.approved ? "Approved" : "Hidden"}
                </button>
                <button
                  disabled={busy === r.id}
                  onClick={() => remove(r.id)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-12 text-center text-[#6B6B6B]">
            No reviews yet — the homepage proof section stays hidden until you
            add real ones.
          </p>
        )}
      </div>
    </div>
  );
}
