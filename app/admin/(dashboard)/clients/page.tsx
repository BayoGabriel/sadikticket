import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { connectDb } from "@/lib/db";
import { ClientModel, type Client } from "@/models/client";
import { ClientsClient } from "@/components/admin/content/ClientsClient";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  await requirePermission("content");
  await connectDb();
  const items = await ClientModel.find().sort({ order: 1, createdAt: 1 }).lean<Client[]>();
  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Logos and project stories on the SerenArt Business page."
      />
      <ClientsClient
        initial={items.map((c) => ({
          id: String(c._id),
          name: c.name,
          engagement: c.engagement ?? "",
          description: c.description ?? "",
          photo: c.photo ?? "",
          logo: c.logo ?? "",
          quote: c.quote ?? "",
          approvalConfirmed: Boolean(c.approvalConfirmed),
          order: c.order ?? 0,
          published: Boolean(c.published),
        }))}
      />
    </>
  );
}
