import { ReactNode } from "react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

async function getMeServer() {
  // Call existing backend /me so auth stays centralized
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ");
  const res = await fetch(`${process.env.APP_URL || ""}/api/v1/auth/me`, {
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    cache: "no-store",
  });
  if (res.status === 401) return null;
  const data = await res.json();
  return data.success
    ? (data.data as { id: string; email: string; role: string })
    : null;
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const me = await getMeServer();
  if (!me) {
    redirect("/admin/login");
  }

  const nav = [
    {
      href: "/admin",
      label: "Dashboard",
      roles: ["SUPER_ADMIN", "EVENT_ADMIN", "CHECK_IN_STAFF"],
    },
    {
      href: "/admin/events",
      label: "Events",
      roles: ["SUPER_ADMIN", "EVENT_ADMIN"],
    },
  ];

  return (
    <div className="min-h-screen bg-(--surface-muted) text-(--text-primary)">
      <header className="h-14 border-b border-(--border) bg-white">
        <div className="mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/admin" className="font-semibold">
            SerenArt Admin
          </Link>
          <div className="text-sm text-(--text-muted)">{me.email}</div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-12 gap-6 py-8">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <nav className="space-y-1">
            {nav
              .filter((n) => n.roles.includes(me.role))
              .map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="block rounded-lg px-3 py-2 hover:bg-(--surface-muted) border border-transparent hover:border-(--border)"
                >
                  {n.label}
                </Link>
              ))}
            <form action="/api/v1/auth/logout" method="post">
              <button className="mt-4 w-full text-left rounded-lg px-3 py-2 hover:bg-(--surface-muted) border border-(--border)">
                Logout
              </button>
            </form>
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
}
