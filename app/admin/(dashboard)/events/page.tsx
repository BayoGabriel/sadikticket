import Link from "next/link";
import Image from "next/image";
import { listEvents } from "@/features/admin/events/api";

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page || "1");
  const limit = 10;
  const search = sp.search;
  const status = sp.status;

  const data = await listEvents({ page, limit, search, status });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Events</h1>
          <p className="text-[#6B6B6B]">Manage your events</p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700"
        >
          Create event
        </Link>
      </div>

      <form className="flex gap-3">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search events..."
          className="w-full md:w-80 rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        />
        <select
          name="status"
          defaultValue={status}
          className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button className="rounded-lg border border-[#E8E8E5] bg-white px-4 py-2 hover:bg-[#F3F3F0]">
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-[#E8E8E5] bg-white">
        <table className="w-full text-left">
          <thead className="border-b border-[#E8E8E5] text-sm text-[#6B6B6B]">
            <tr>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((e) => (
              <tr
                key={e.id}
                className="border-b last:border-b-0 border-[#E8E8E5] hover:bg-[#FAFAF8]"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-md bg-[#F3F3F0]">
                      {e.coverImage ? (
                        <Image
                          src={e.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs text-[#6B6B6B]">
                          No image
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{e.name}</div>
                      <div className="text-sm text-[#6B6B6B]">/{e.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm">
                  {e.startsAt ? new Date(e.startsAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-4 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      e.status === "PUBLISHED"
                        ? "bg-emerald-50 text-emerald-700"
                        : e.status === "DRAFT"
                          ? "bg-gray-100 text-gray-700"
                          : e.status === "CANCELLED"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-sm">
                  {new Date(e.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/events/${e.id}`}
                      className="text-sm text-emerald-700 hover:underline"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/events/${e.id}/tickets`}
                      className="text-sm text-emerald-700 hover:underline"
                    >
                      Tickets
                    </Link>
                    <Link
                      href={`/admin/events/${e.id}/edit`}
                      className="text-sm text-emerald-700 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {data.items.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-[#6B6B6B]"
                >
                  <div className="mx-auto max-w-md">
                    <div className="text-2xl">🗓️</div>
                    <h3 className="mt-2 font-semibold text-[#171717]">
                      No events yet
                    </h3>
                    <p className="mt-1 text-sm">
                      Create your first event to get started.
                    </p>
                    <div className="mt-4">
                      <Link
                        href="/admin/events/new"
                        className="inline-flex items-center rounded-lg bg-emerald-600 text-white px-4 py-2 font-medium hover:bg-emerald-700"
                      >
                        Create event
                      </Link>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-[#6B6B6B]">
          Page {data.page} of {data.totalPages}
        </div>
        <div className="flex gap-2">
          {data.page > 1 && (
            <Link
              href={`?${new URLSearchParams({ ...(sp as any), page: String(data.page - 1) }).toString()}`}
              className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 hover:bg-[#F3F3F0]"
            >
              Previous
            </Link>
          )}
          {data.page < data.totalPages && (
            <Link
              href={`?${new URLSearchParams({ ...(sp as any), page: String(data.page + 1) }).toString()}`}
              className="rounded-lg border border-[#E8E8E5] bg-white px-3 py-2 hover:bg-[#F3F3F0]"
            >
              Next
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
