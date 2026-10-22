import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { connectDb } from "@/lib/db";
import { UserModel, USER_ROLES } from "@/models/user";
import { TeamClient } from "@/components/admin/settings/TeamClient";

export const metadata: Metadata = { title: "Team" };
export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  EVENTS_STAFF: "Events staff",
  DOOR_STAFF: "Door staff",
  CONTENT_EDITOR: "Content editor",
};

export default async function AdminTeamPage() {
  const me = await requirePermission("team");
  await connectDb();
  const users = await UserModel.find()
    .select({ email: 1, name: 1, role: 1, active: 1, invitedAt: 1, lastLoginAt: 1 })
    .sort({ createdAt: 1 })
    .lean();
  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Who can sign in to admin and what they're allowed to touch."
      />
      <TeamClient
        me={me.id}
        roles={USER_ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r }))}
        initial={users.map((u) => ({
          id: String(u._id),
          email: u.email,
          name: u.name,
          role: u.role,
          active: Boolean(u.active),
          invitedAt: u.invitedAt ? new Date(u.invitedAt).toISOString() : null,
          lastLoginAt: u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : null,
        }))}
      />
    </>
  );
}
