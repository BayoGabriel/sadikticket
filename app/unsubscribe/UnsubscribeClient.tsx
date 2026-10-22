"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function UnsubscribeClient() {
  const sp = useSearchParams();
  const [state, setState] = useState<"working" | "done" | "error">("working");

  useEffect(() => {
    const email = sp.get("email");
    const sig = sp.get("sig");
    if (!email || !sig) {
      const t = setTimeout(() => setState("error"), 0);
      return () => clearTimeout(t);
    }
    let live = true;
    fetch(`/api/v1/subscribers/unsubscribe?email=${encodeURIComponent(email)}&sig=${encodeURIComponent(sig)}`)
      .then((r) => r.json())
      .then((d) => { if (live) setState(d.success ? "done" : "error"); })
      .catch(() => { if (live) setState("error"); });
    return () => { live = false; };
  }, [sp]);

  return (
    <div className="mt-8 rounded-2xl border border-[#e8e8e5] bg-white p-8 text-center">
      {state === "working" && <p className="text-[#4a4a45]">One moment…</p>}
      {state === "done" && (
        <>
          <p className="font-display text-2xl font-semibold text-[#003118]">You&rsquo;re unsubscribed.</p>
          <p className="mt-2 text-sm text-[#4a4a45]">No more announcements from us. Changed your mind? Subscribe again from the site footer.</p>
        </>
      )}
      {state === "error" && (
        <>
          <p className="font-display text-2xl font-semibold text-[#003118]">That link didn&rsquo;t work.</p>
          <p className="mt-2 text-sm text-[#4a4a45]">It may have expired or been copied incompletely. Reply to the email or WhatsApp us and we&rsquo;ll remove you.</p>
        </>
      )}
      <Link href="/" className="mt-6 inline-block rounded-full bg-[#f27a00] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#d56c00]">
        Back to SerenArt
      </Link>
    </div>
  );
}
