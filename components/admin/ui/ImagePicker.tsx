"use client";

import { useRef, useState } from "react";
import { Icon } from "./icons";

export type UploadedFile = {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  kind: "image" | "video";
};

// Uploads to /api/v1/admin/uploads (Cloudinary) and returns the stored file.
export function ImagePicker({
  value,
  onChange,
  folder = "serenart/admin",
  acceptVideo = false,
  label = "Choose image",
}: {
  value: string;
  onChange: (file: UploadedFile | null) => void;
  folder?: string;
  acceptVideo?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);
      const res = await fetch("/api/v1/admin/uploads", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Upload failed — try again.");
      onChange(data.data ?? data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed — try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative overflow-hidden rounded-xl" style={{ border: "1px solid var(--admin-line)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove image"
            className="a-btn a-btn-sm absolute right-2 top-2"
            style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 text-sm font-semibold transition hover:bg-black/[0.02]"
          style={{ borderColor: "var(--admin-line)", color: "var(--admin-ink-soft)" }}
        >
          <Icon name="image" size={20} />
          {busy ? "Uploading…" : label}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={acceptVideo ? "image/*,video/mp4,video/webm" : "image/*"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void upload(f);
        }}
      />
      {error && (
        <p className="a-error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
