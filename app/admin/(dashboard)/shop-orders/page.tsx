import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { connectDb } from "@/lib/db";
import { ProductOrderModel, type ProductOrder } from "@/models/productOrder";
import { ShopOrdersClient } from "@/components/admin/orders/ShopOrdersClient";

export const metadata: Metadata = { title: "Shop orders" };
export const dynamic = "force-dynamic";

export default async function AdminShopOrdersPage() {
  await requirePermission("orders");
  await connectDb();
  const items = await ProductOrderModel.find()
    .sort({ createdAt: -1 })
    .limit(200)
    .lean<ProductOrder[]>();
  return (
    <>
      <PageHeader
        title="Shop orders"
        subtitle="Paid shop orders land here — mark them fulfilled once handed over."
      />
      <ShopOrdersClient
        initial={items.map((o) => ({
          id: String(o._id),
          reference: o.paymentReference,
          customer: `${o.customerName} · ${o.customerEmail}${o.customerPhone ? ` · ${o.customerPhone}` : ""}`,
          items: o.items.map((i) => `${i.quantity} × ${i.name}`).join(", "),
          total: o.total,
          status: o.status,
          deliveryNote: o.deliveryNote ?? "",
          fulfilled: Boolean(o.fulfilledAt),
          createdAt: new Date(o.createdAt as unknown as string).toISOString(),
        }))}
      />
    </>
  );
}
