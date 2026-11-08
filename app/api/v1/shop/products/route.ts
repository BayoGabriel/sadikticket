import { ok, fail } from "@/lib/response";
import { contentService } from "@/services/contentService";

// GET /api/v1/shop/products — published items for the shop + checkout pages.
export async function GET() {
  try {
    const items = await contentService.products();
    return ok({ items });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
