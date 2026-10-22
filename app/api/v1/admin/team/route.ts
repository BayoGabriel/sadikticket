import { NextRequest } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { connectDb } from "@/lib/db";
import { UserModel, USER_ROLES } from "@/models/user";
import { emailService } from "@/services/emailService";
import { auditService } from "@/services/auditService";
import { ApiError } from "@/lib/errors";
import { env } from "@/lib/env";

// GET /api/v1/admin/team — everyone with access.
export async function GET() {
  try {
    await requirePermission("team");
    await connectDb();
    const users = await UserModel.find()
      .select({ email: 1, name: 1, role: 1, active: 1, invitedAt: 1, lastLoginAt: 1, createdAt: 1 })
      .sort({ createdAt: 1 })
      .lean();
    return ok({
      items: users.map((u) => ({
        id: String(u._id),
        email: u.email,
        name: u.name,
        role: u.role,
        active: u.active,
        invitedAt: u.invitedAt,
        lastLoginAt: u.lastLoginAt,
      })),
      roles: USER_ROLES,
    });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  role: z.enum(USER_ROLES as [string, ...string[]]),
});

// POST — invite: creates the account and emails a set-your-password link.
export async function POST(req: NextRequest) {
  try {
    const actor = await requirePermission("team");
    const input = inviteSchema.parse(await req.json());
    const email = input.email.trim().toLowerCase();

    await connectDb();
    const existing = await UserModel.findOne({ email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } });
    if (existing) {
      if (!existing.active) {
        // Re-invite a deactivated teammate: reactivate + reset their role.
        existing.active = true;
        existing.role = input.role;
        existing.name = input.name;
        existing.invitedAt = new Date();
        await existing.save();
        await sendInvite(existing, actor.name);
        await auditService.record({ actor, action: "team.reactivated", entityType: "user", entityId: String(existing._id), entityLabel: existing.email });
        return ok({ id: String(existing._id), reactivated: true });
      }
      throw new ApiError("CONFLICT", "They're already on the team.", 409);
    }

    const token = crypto.randomBytes(32).toString("hex");
    const user = await UserModel.create({
      email,
      name: input.name,
      role: input.role,
      // Placeholder hash — the invite link sets the real password.
      passwordHash: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10),
      invitedAt: new Date(),
      passwordResetToken: crypto.createHash("sha256").update(token).digest("hex"),
      passwordResetExpires: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days
    });
    await sendInvite(user, actor.name, token);
    await auditService.record({ actor, action: "team.invited", entityType: "user", entityId: String(user._id), entityLabel: `${email} (${input.role})` });
    return ok({ id: String(user._id) }, { status: 201 });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}

async function sendInvite(user: { email: string; name: string }, inviterName?: string, token?: string) {
  // If no fresh token was supplied (reactivation), mint one.
  let link = "";
  if (token) link = `${env.APP_URL}/admin/reset-password?token=${token}`;
  else {
    const t = crypto.randomBytes(32).toString("hex");
    await UserModel.updateOne({ _id: (user as { _id?: unknown })._id }, {
      $set: {
        passwordResetToken: crypto.createHash("sha256").update(t).digest("hex"),
        passwordResetExpires: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    });
    link = `${env.APP_URL}/admin/reset-password?token=${t}`;
  }
  await emailService.send({
    to: user.email,
    subject: "You've been added to the SerenArt team",
    template: "team-invite",
    text: `Hi ${user.name},\n\n${inviterName ?? "The SerenArt team"} added you to the event admin. Set your password here (the link works for 2 days):\n\n${link}\n\nThen sign in at ${env.APP_URL}/admin/login.\n\n— SerenArt`,
  }).catch((e) => console.error("invite email failed", e));
}
