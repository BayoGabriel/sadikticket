import type { Metadata } from "next";
import { Suspense } from "react";
import { UnsubscribeClient } from "./UnsubscribeClient";

export const metadata: Metadata = {
  title: "Unsubscribe | SerenArt",
  robots: { index: false },
};

export default function UnsubscribePage() {
  return (
    <main className="min-h-screen bg-[#fffedd] text-[#1a1a1a]">
      <section className="mx-auto max-w-xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-4xl font-semibold tracking-[-0.04em] text-[#003118]">
          Email preferences
        </h1>
        <Suspense>
          <UnsubscribeClient />
        </Suspense>
      </section>
    </main>
  );
}
