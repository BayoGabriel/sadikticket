"use client";

import { useState } from "react";
import { Icon } from "@/components/admin/ui/icons";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Field, Toggle } from "@/components/admin/ui/Field";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { ConfirmDialog } from "@/components/admin/ui/Modal";
import { ImagePicker } from "@/components/admin/ui/ImagePicker";
import { useToast } from "@/components/admin/ui/Toast";
import { formatNaira } from "@/lib/format";

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number; // kobo
  currency: string;
  images: string[];
  inStock: boolean;
  order: number;
  published: boolean;
};

const emptyProduct = (): ProductRow => ({
  id: "",
  name: "",
  description: "",
  price: 0,
  currency: "NGN",
  images: [],
  inStock: true,
  order: 0,
  published: true,
});

export function ProductsClient({ initial }: { initial: ProductRow[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [priceNaira, setPriceNaira] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<ProductRow | null>(null);

  const openEditor = (p: ProductRow) => {
    setEditing(p);
    setPriceNaira(p.price ? String(p.price / 100) : "");
  };

  const refresh = async () => {
    const res = await fetch("/api/v1/admin/content/products", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setItems(data.data.items);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setItems(next);
    await fetch("/api/v1/admin/content/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((i) => i.id) }),
    });
  };

  const save = async () => {
    if (!editing) return;
    const naira = Number(priceNaira);
    if (!Number.isFinite(naira) || naira < 0) {
      toast("Enter a valid price in naira.", { error: true });
      return;
    }
    const payload = { ...editing, price: Math.round(naira * 100) };
    setSaving(true);
    try {
      const res = await fetch(editing.id ? `/api/v1/admin/content/products/${editing.id}` : "/api/v1/admin/content/products", {
        method: editing.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Couldn't save.");
      toast("Saved — the Shop page is updated.");
      setEditing(null);
      await refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Couldn't save — try again.", { error: true });
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (item: ProductRow) => {
    setItems(items.map((i) => (i === item ? { ...i, published: !i.published } : i)));
    const res = await fetch(`/api/v1/admin/content/products/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    if (!res.ok) {
      setItems(items);
      toast("Not saved — try again.", { error: true });
    } else {
      toast(item.published ? "Hidden from the Shop page." : "Live on the Shop page.", {
        actionLabel: "Undo",
        onAction: () => void togglePublished({ ...item, published: item.published }),
      });
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/v1/admin/content/products/${deleting.id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Removed.");
      setDeleting(null);
      await refresh();
    } else toast("Couldn't delete — try again.", { error: true });
  };

  const setImage = (index: number, url: string) => {
    if (!editing) return;
    const images = [...editing.images];
    if (url) images[index] = url;
    else images.splice(index, 1);
    setEditing({ ...editing, images });
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    if (!editing) return;
    const images = [...editing.images];
    const j = index + dir;
    if (j < 0 || j >= images.length) return;
    [images[index], images[j]] = [images[j], images[index]];
    setEditing({ ...editing, images });
  };

  return (
    <div className="mt-5">
      {items.length === 0 ? (
        <EmptyState
          icon="tag"
          title="No products yet"
          body="Post items for sale — a price, photos and a short description — and they'll appear on the Shop page."
          actionLabel="Add a product"
          onAction={() => openEditor(emptyProduct())}
        />
      ) : (
        <div className="a-card divide-y">
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-sm font-semibold" style={{ color: "var(--admin-ink-soft)" }}>
              {items.length} product{items.length === 1 ? "" : "s"}
            </p>
            <button type="button" onClick={() => openEditor(emptyProduct())} className="a-btn a-btn-orange a-btn-sm">
              <Icon name="plus" size={14} /> Add a product
            </button>
          </div>
          {items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex flex-col">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => void move(i, -1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                  <Icon name="chevronUp" size={14} />
                </button>
                <button type="button" aria-label="Move down" disabled={i === items.length - 1} onClick={() => void move(i, 1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                  <Icon name="chevronDown" size={14} />
                </button>
              </div>
              <div className="flex h-10 w-16 flex-none items-center justify-center overflow-hidden rounded-lg" style={{ background: "var(--mint)" }}>
                {item.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Icon name="image" size={16} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold">{item.name}</span>
                  {!item.published && <span className="a-chip a-chip-dashed">Hidden</span>}
                  {!item.inStock && <span className="a-chip a-chip-amber">Sold out</span>}
                </div>
                <p className="truncate text-xs" style={{ color: "var(--admin-ink-soft)" }}>
                  {formatNaira(item.price)} · {item.description || "No description"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Toggle checked={item.published} onChange={() => void togglePublished(item)} label={item.published ? "Published" : "Hidden"} />
                <button type="button" onClick={() => openEditor({ ...item, images: [...item.images] })} className="a-btn a-btn-ghost a-btn-sm">Edit</button>
                <button type="button" onClick={() => setDeleting(item)} aria-label={`Delete ${item.name}`} className="a-btn a-btn-ghost a-btn-sm" style={{ color: "var(--admin-red)" }}>
                  <Icon name="trash" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit — ${editing.name}` : "Add a product"}
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className="a-btn a-btn-ghost">Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving || !editing?.name || !priceNaira} className="a-btn a-btn-orange">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Product name" required>
              <input className="a-input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Price (₦)" required hint="Enter the amount in naira — e.g. 15000.">
              <input
                className="a-input"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
              />
            </Field>
            <Field label="Short description" hint="One or two lines on the product card.">
              <textarea className="a-input min-h-20" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
            <Field label="Photos" hint="First photo is the cover — guests can flip through the rest.">
              <div className="space-y-3">
                {editing.images.map((url, i) => (
                  <div key={`${url}-${i}`} className="flex items-start gap-2">
                    <div className="flex-1">
                      <ImagePicker value={url} folder="serenart/shop" onChange={(f) => setImage(i, f?.url ?? "")} />
                    </div>
                    <div className="flex flex-col pt-1">
                      <button type="button" aria-label="Move image earlier" disabled={i === 0} onClick={() => moveImage(i, -1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                        <Icon name="chevronUp" size={14} />
                      </button>
                      <button type="button" aria-label="Move image later" disabled={i === editing.images.length - 1} onClick={() => moveImage(i, 1)} className="rounded p-1 disabled:opacity-25 hover:bg-black/5">
                        <Icon name="chevronDown" size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                {editing.images.length < 8 && (
                  <ImagePicker
                    value=""
                    folder="serenart/shop"
                    label={editing.images.length ? "Add another photo" : "Add a photo"}
                    onChange={(f) => f && setEditing({ ...editing, images: [...editing.images, f.url] })}
                  />
                )}
              </div>
            </Field>
            <Toggle checked={editing.inStock} onChange={(v) => setEditing({ ...editing, inStock: v })} label="In stock" hint="Off shows a “Sold out” tag on the Shop page." />
            <Toggle checked={editing.published} onChange={(v) => setEditing({ ...editing, published: v })} label="Show on the Shop page" />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => void remove()}
        title={`Remove ${deleting?.name}?`}
        body="It leaves the Shop page."
        confirmLabel="Remove"
      />
    </div>
  );
}
