"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  getOrderStatusByReference,
  ticketsUrlForOrder,
} from "@/features/checkout/api";
import type { OrderStatusPayload } from "@/features/checkout/types";

function PaymentCallbackInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const reference = sp.get("reference") || sp.get("trxref") || "";
  const [status, setStatus] = useState<
    "processing" | "success" | "failed" | "pending" | "notfound"
  >("processing");
  const [payload, setPayload] = useState<OrderStatusPayload | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    let tries = 0;
    const poll = async () => {
      try {
        const res = await getOrderStatusByReference(reference);
        if (cancelled) return;
        setPayload(res);
        if (!res.found) {
          setStatus("notfound");
          return;
        }
        if (res.status === "PAID") {
          setStatus("success");
          return;
        }
        if (
          res.status === "FAILED" ||
          res.status === "CANCELLED" ||
          res.paymentStatus === "FAILED"
        ) {
          setStatus("failed");
          return;
        }
        // pending
        setStatus("pending");
      } catch {
        // network/temporary error: keep pending
        setStatus("pending");
      } finally {
        tries += 1;
        setElapsed((e) => e + 2);
        if (
          !cancelled &&
          tries < 45 &&
          status !== "success" &&
          status !== "failed"
        ) {
          setTimeout(poll, 2000);
        }
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <main className="min-h-[60vh] grid place-items-center bg-(--surface-muted)">
      <div className="rounded-2xl bg-white border border-(--border) p-8 text-center max-w-md">
        {status === "processing" && (
          <>
            <h1 className="text-xl font-semibold">Confirming your payment</h1>
            <p className="mt-2 text-(--text-muted)">
              We're securely confirming your payment and preparing your ticket.
              Please don't close this page.
            </p>
          </>
        )}
        {status === "pending" && (
          <>
            <h1 className="text-xl font-semibold">
              Payment is being confirmed
            </h1>
            <p className="mt-2 text-(--text-muted)">
              We're waiting for confirmation from the payment provider. This can
              take a few moments.
            </p>
            <div className="mt-4 text-sm text-(--text-muted)">
              Elapsed: {elapsed}s
            </div>
          </>
        )}
        {status === "success" && payload && (
          <>
            <h1 className="text-xl font-semibold text-(--brand-primary)">
              Payment confirmed
            </h1>
            {payload.event && (
              <p className="mt-2 text-(--text-primary)">{payload.event.name}</p>
            )}
            <p className="mt-1 text-(--text-muted)">Your tickets are ready.</p>
            <a
              href={ticketsUrlForOrder(payload.id!)}
              className="mt-4 inline-flex items-center rounded-lg bg-(--brand-primary) text-white px-4 py-2 font-medium hover:bg-(--brand-primary-hover)"
            >
              View my tickets
            </a>
            <p className="mt-2 text-xs text-(--text-muted)">
              We've also sent ticket details to your email.
            </p>
          </>
        )}
        {status === "failed" && (
          <>
            <h1 className="text-xl font-semibold text-red-600">
              Payment not confirmed
            </h1>
            <p className="mt-2 text-(--text-muted)">
              We couldn't confirm this payment. No ticket has been issued.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 rounded-lg border border-(--border) bg-white px-4 py-2 hover:bg-(--surface-muted)"
            >
              Return home
            </button>
          </>
        )}
        {status === "notfound" && (
          <>
            <h1 className="text-xl font-semibold">Order not found</h1>
            <p className="mt-2 text-(--text-muted)">
              We couldn't find this order reference.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 rounded-lg border border-(--border) bg-white px-4 py-2 hover:bg-(--surface-muted)"
            >
              Go home
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[60vh] grid place-items-center bg-(--surface-muted)">
          <div className="rounded-2xl bg-white border border-(--border) p-8 text-center max-w-md">
            <h1 className="text-xl font-semibold">Confirming your payment</h1>
            <p className="mt-2 text-(--text-muted)">Please wait…</p>
          </div>
        </main>
      }
    >
      <PaymentCallbackInner />
    </Suspense>
  );
}
