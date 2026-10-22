import { adminFetch } from "@/features/admin/api";

type EnquiryRow = {
  id: string;
  kind: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  occasion: string;
  eventName: string;
  city: string;
  createdAt: string;
};

const kindLabels: Record<string, string> = {
  "private-booking": "Private booking",
  business: "Business",
  waitlist: "Waitlist",
  updates: "Subscriber",
  general: "Contact form",
};

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const kind = sp.kind ?? "";
  const qs = new URLSearchParams();
  if (kind) qs.set("kind", kind);

  let items: EnquiryRow[] = [];
  let loadError: string | null = null;
  try {
    const data = await adminFetch<{ items: EnquiryRow[] }>(
      `/api/v1/admin/enquiries${qs.size ? `?${qs}` : ""}`,
    );
    items = data.items;
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load enquiries";
  }

  const csvHref = `/api/v1/admin/enquiries?${new URLSearchParams({ ...(kind ? { kind } : {}), format: "csv" })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Enquiries</h1>
          <p className="text-[#6B6B6B]">
            Private bookings, business, waitlist and subscribers — one list
          </p>
        </div>
        <a
          href={csvHref}
          className="inline-flex items-center rounded-lg border border-[#E8E8E5] bg-white px-4 py-2 font-medium hover:bg-[#F3F3F0]"
        >
          Export CSV
        </a>
      </div>

      <form className="flex gap-3">
        <select
          name="kind"
          defaultValue={kind}
          className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
        >
          <option value="">All kinds</option>
          <option value="private-booking">Private bookings</option>
          <option value="business">Business</option>
          <option value="waitlist">Waitlist</option>
          <option value="updates">Subscribers</option>
          <option value="general">Contact form</option>
        </select>
        <button className="rounded-lg border border-[#E8E8E5] bg-white px-4 py-2 hover:bg-[#F3F3F0]">
          Filter
        </button>
      </form>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      <div className="overflow-x-auto rounded-2xl border border-[#E8E8E5] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-[#E8E8E5] text-sm text-[#6B6B6B]">
            <tr>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <tr
                key={e.id}
                className="border-b last:border-b-0 border-[#E8E8E5] hover:bg-[#FAFAF8]"
              >
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex rounded-full bg-[#e7efe9] px-2 py-1 text-xs font-medium text-[#003118]">
                    {kindLabels[e.kind] ?? e.kind}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium">{e.name || "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <div>{e.email}</div>
                  {e.phone && <div className="text-[#6B6B6B]">{e.phone}</div>}
                </td>
                <td className="px-4 py-3 text-sm text-[#6B6B6B]">
                  {[e.company, e.occasion, e.eventName, e.city]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </td>
                <td className="px-4 py-3 text-sm">
                  {e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {items.length === 0 && !loadError && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[#6B6B6B]">
                  Nothing here yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
