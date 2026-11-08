import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { connectDb } from "@/lib/db";
import { ProductModel, type Product } from "@/models/product";
import { ProductsClient } from "@/components/admin/content/ProductsClient";

export const metadata: Metadata = { title: "Shop products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requirePermission("content");
  await connectDb();
  const items = await ProductModel.find()
    .sort({ order: 1, createdAt: 1 })
    .lean<Product[]>();
  return (
    <>
      <PageHeader
        title="Shop products"
        subtitle="Items for sale on the Shop page — kits, merch and gift sets."
      />
      <ProductsClient
        initial={items.map((p) => ({
          id: String(p._id),
          name: p.name,
          description: p.description ?? "",
          price: p.price ?? 0,
          currency: p.currency ?? "NGN",
          images: p.images ?? [],
          inStock: Boolean(p.inStock ?? true),
          order: p.order ?? 0,
          published: Boolean(p.published),
        }))}
      />
    </>
  );
}
