"use client";
import { useState } from "react";
import Image from "next/image";

export function ImageUploader({ eventId, initialUrl }: { eventId: string; initialUrl?: string | null }) {
  const [url, setUrl] = useState<string | null>(initialUrl || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max file size is 5MB");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`/api/v1/admin/events/${eventId}/image`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message || "Upload failed");
      setUrl(data.data.url);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const onRemove = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/events/${eventId}/image`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data?.error?.message || "Remove failed");
      setUrl(null);
    } catch (e: any) {
      setError(e?.message || "Remove failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-(--border) bg-white p-4">
        {url ? (
          <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-(--surface-muted)">
            <Image src={url} alt="Event image" fill className="object-cover" />
          </div>
        ) : (
          <label className="grid place-items-center aspect-4/3 rounded-xl bg-(--surface-muted) cursor-pointer">
            <div className="text-(--text-muted)">{loading ? "Uploading…" : "Upload event image"}</div>
            <input type="file" accept="image/*" className="sr-only" onChange={onChange} disabled={loading} />
          </label>
        )}
      </div>
      {url && (
        <div className="flex gap-3">
          <label className="inline-flex items-center rounded-lg border border-(--border) bg-white px-3 py-2 cursor-pointer hover:bg-(--surface-muted)">
            Replace image
            <input type="file" accept="image/*" className="sr-only" onChange={onChange} disabled={loading} />
          </label>
          <button type="button" onClick={onRemove} disabled={loading} className="inline-flex items-center rounded-lg border border-(--border) bg-white px-3 py-2 hover:bg-(--surface-muted)">Remove</button>
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
