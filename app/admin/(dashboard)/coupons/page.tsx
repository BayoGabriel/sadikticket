import { adminFetch } from "@/features/admin/api";
import { listEvents } from "@/features/admin/events/api";
import { CouponsManager, type CouponRow } from "./CouponsManager";

export default async function AdminCouponsPage() {
  let items: CouponRow[] = [];
  let events: { id: string; name: string }[] = [];
  let loadError: string | null = null;
  try {
    const [coupons, evs] = await Promise.all([
      adminFetch<{ items: CouponRow[] }>("/api/v1/admin/coupons"),
      listEvents({ limit: 50 }).catch(() => ({ items: [] as { id: string; name: string }[] })),
    ]);
    items = coupons.items;
    events = evs.items.map((e) => ({ id: e.id, name: e.name }));
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load coupons";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <p className="text-[#6B6B6B]">
          Codes guests can apply on an event page for a discount.
        </p>
      </div>
      {loadError && <p className="text-sm text-red-600">{loadError}</p>}
      <CouponsManager initial={items} events={events} />
    </div>
  );
}
