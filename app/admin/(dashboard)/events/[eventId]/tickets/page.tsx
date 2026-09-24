"use client";
import { use, useEffect, useState } from "react";
import {
  listTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "@/features/admin/events/api";

export default function EventTicketsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const { eventId } = use(params);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listTicketTypes(eventId, 1, 100);
      setItems(data.items);
    } catch (e: any) {
      setError(e?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [eventId]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input: any = {
      name: fd.get("name"),
      description: fd.get("description") || undefined,
      price: Number(fd.get("price") || 0),
      currency: fd.get("currency") || "NGN",
      quantity: Number(fd.get("quantity") || 0),
      salesStart: fd.get("salesStart") || undefined,
      salesEnd: fd.get("salesEnd") || undefined,
      status: fd.get("status") || "ACTIVE",
    };
    try {
      if (editing) {
        await updateTicketType(eventId, editing.id, input);
      } else {
        await createTicketType(eventId, input);
      }
      setShowForm(false);
      setEditing(null);
      (e.target as HTMLFormElement).reset();
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to save ticket type");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this ticket type?")) return;
    try {
      await deleteTicketType(eventId, id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tickets</h1>
          <p className="text-[#6B6B6B]">
            Create and manage the ticket options available for this event.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700"
        >
          Add ticket type
        </button>
      </div>

      {error && (
        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6">
          Loading…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-white border border-[#E8E8E5] p-6"
            >
              <div className="font-semibold">{t.name}</div>
              <div className="mt-1 text-[#6B6B6B]">
                {t.currency} {t.price.toLocaleString()}
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-[#6B6B6B]">Capacity</dt>
                  <dd className="font-medium">{t.quantity}</dd>
                </div>
                <div>
                  <dt className="text-[#6B6B6B]">Sold</dt>
                  <dd className="font-medium">{t.quantitySold ?? 0}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[#6B6B6B]">Sales</dt>
                  <dd className="font-medium">
                    {t.salesStart
                      ? new Date(t.salesStart).toLocaleDateString()
                      : "—"}{" "}
                    →{" "}
                    {t.salesEnd
                      ? new Date(t.salesEnd).toLocaleDateString()
                      : "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-[#6B6B6B]">Status</dt>
                  <dd className="font-medium">{t.status}</dd>
                </div>
              </dl>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditing(t);
                    setShowForm(true);
                  }}
                  className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm hover:bg-[#F3F3F0]"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(t.id)}
                  className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 text-sm hover:bg-[#F3F3F0]"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded-2xl bg-white border border-[#E8E8E5] p-6 text-[#6B6B6B]">
              No ticket types yet
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#E8E8E5] p-6">
            <h3 className="font-semibold">
              {editing ? "Edit ticket type" : "Add ticket type"}
            </h3>
            <form onSubmit={onSubmit} className="mt-4 grid gap-3">
              <input
                name="name"
                defaultValue={editing?.name}
                placeholder="Name"
                required
                className="rounded-lg border border-[#E8E8E5] px-3 py-2"
              />
              <textarea
                name="description"
                defaultValue={editing?.description}
                placeholder="Description"
                className="rounded-lg border border-[#E8E8E5] px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="price"
                  type="number"
                  step="1"
                  min="0"
                  defaultValue={editing?.price}
                  placeholder="Price"
                  required
                  className="rounded-lg border border-[#E8E8E5] px-3 py-2"
                />
                <input
                  name="currency"
                  defaultValue={editing?.currency || "NGN"}
                  placeholder="Currency"
                  className="rounded-lg border border-[#E8E8E5] px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="quantity"
                  type="number"
                  min="0"
                  defaultValue={editing?.quantity}
                  placeholder="Capacity"
                  className="rounded-lg border border-[#E8E8E5] px-3 py-2"
                />
                <select
                  name="status"
                  defaultValue={editing?.status || "ACTIVE"}
                  className="rounded-lg border border-[#E8E8E5] px-3 py-2"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="salesStart"
                  type="datetime-local"
                  defaultValue={
                    editing?.salesStart
                      ? new Date(editing.salesStart).toISOString().slice(0, 16)
                      : ""
                  }
                  className="rounded-lg border border-[#E8E8E5] px-3 py-2"
                />
                <input
                  name="salesEnd"
                  type="datetime-local"
                  defaultValue={
                    editing?.salesEnd
                      ? new Date(editing.salesEnd).toISOString().slice(0, 16)
                      : ""
                  }
                  className="rounded-lg border border-[#E8E8E5] px-3 py-2"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 hover:bg-[#F3F3F0]"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
