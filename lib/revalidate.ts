import { revalidatePath } from "next/cache";

// After any admin mutation that affects public pages. Public pages render
// dynamically so this is belt-and-braces — it also clears any cached shells.
export function revalidatePublicSite(slug?: string) {
  try {
    for (const p of ["/", "/events", "/lagos", "/benin-city", "/experiences", "/gallery", "/about", "/faqs"]) {
      revalidatePath(p);
    }
    if (slug) revalidatePath(`/events/${slug}`);
  } catch {
    // revalidatePath only works in a request context — ignore in scripts
  }
}
