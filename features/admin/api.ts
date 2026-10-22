// Shared fetch helper for admin pages — forwards the session cookie when
// running on the server, plain relative fetch on the client.
export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  if (typeof window !== "undefined") {
    res = await fetch(path, init);
  } else {
    const { headers: nextHeaders, cookies: nextCookies } = await import(
      "next/headers"
    );
    const h = await nextHeaders();
    const host = h.get("x-forwarded-host") || h.get("host") || "localhost";
    const proto = h.get("x-forwarded-proto") || "http";
    const cookieStore = await nextCookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
    const headers = new Headers(init?.headers);
    if (cookieHeader) headers.set("cookie", cookieHeader);
    res = await fetch(new URL(path, `${proto}://${host}`), {
      ...init,
      headers,
      cache: "no-store",
    });
  }
  const data = await res.json();
  if (!res.ok || !data.success)
    throw new Error(data?.error?.message || `Request failed: ${path}`);
  return data.data as T;
}
