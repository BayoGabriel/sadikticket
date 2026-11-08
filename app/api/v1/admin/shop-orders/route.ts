import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { ProductOrderModel, type ProductOrder } from "@/models/productOrder";

// GET /api/v1/admin/shop-orders — newest first.
export async function GET() {
  try {
    await requirePermission("orders");
    await connectDb();
    const items = await ProductOrderModel.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean<ProductOrder[]>();
    return ok({ items: items.map((o) => ({ ...o, id: String(o._id) })) });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
