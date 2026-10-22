import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthUser, can } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { connectDb } from "@/lib/db";
import { EnquiryModel } from "@/models/enquiry";
import { OrderModel } from "@/models/order";
import { WaitlistEntryModel } from "@/models/waitlistEntry";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const me = await getAuthUser();
  if (!me) redirect("/admin/login");

  // Sidebar badge counts — cheap aggregates, failures degrade to zero badges.
  let badges = { enquiries: 0, orders: 0, waitlist: 0 };
  try {
    await connectDb();
    const [enquiries, orders, waitlist] = await Promise.all([
      can(me.role, "enquiries")
        ? EnquiryModel.countDocuments({
            kind: { $in: ["private-booking", "business", "general"] },
            read: false,
            stage: { $nin: ["spam"] },
          })
        : 0,
      can(me.role, "orders")
        ? OrderModel.countDocuments({ status: { $in: ["PENDING", "PAYMENT_PROCESSING"] } })
        : 0,
      can(me.role, "waitlist")
        ? WaitlistEntryModel.countDocuments({ status: "waiting" })
        : 0,
    ]);
    badges = { enquiries, orders, waitlist };
  } catch {
    // DB hiccup — shell still renders, badges stay at 0
  }

  return <AdminShell user={{ name: me.name, email: me.email, role: me.role }} badges={badges}>{children}</AdminShell>;
}
