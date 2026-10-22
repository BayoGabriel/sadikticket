"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/admin/ui/icons";
import { useToast } from "@/components/admin/ui/Toast";

// Drag-drop image upload → /api/v1/admin/uploads. Shows preview when set.
export function ImageField({
  value,
  onChange,
  folder = "serenart/events",
  label = "Drop a photo here or browse",
  aspect = "aspect-[4/3]",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const { toast } = useToast();

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);
      const res = await fetch("/api/v1/admin/uploads", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Upload failed");
      onChange(data.data.url);
      toast("Photo uploaded.");
    } catch (e) {
      toast((e as Error).message, { error: true });
    } finally {
      setBusy(false);
      setDrag(false);
    }
  }

  return (
    <div>
      {value ? (
        <div className={`relative ${aspect} overflow-hidden rounded-xl`} style={{ background: "var(--mint)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <div className="absolute right-2 top-2 flex gap-1.5">
            <button type="button" className="a-btn a-btn-green a-btn-sm" onClick={() => inputRef.current?.click()}>
              Replace
            </button>
            <button type="button" className="a-btn a-btn-sm" style={{ background: "#fff", color: "var(--admin-red)" }} onClick={() => onChange("")}>
              <Icon name="trash" size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`flex ${aspect} w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors`}
          style={{ borderColor: drag ? "var(--orange)" : "var(--admin-line)", background: drag ? "var(--peach-2)" : "transparent" }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) upload(f);
          }}
        >
          <Icon name="upload" size={22} />
          <span className="text-sm font-semibold">{busy ? "Uploading…" : label}</span>
          <span className="text-xs" style={{ color: "var(--admin-ink-soft)" }}>JPG, PNG or WebP · up to 15MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
