import { NextRequest } from "next/server";
import crypto from "crypto";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { connectDb } from "@/lib/db";
import { UserModel } from "@/models/user";
import { env } from "@/lib/env";
import { emailService } from "@/services/emailService";

const limiter = new RateLimiterMemory({ points: 4, duration: 600 });

// POST /api/v1/auth/forgot  { email } — always answers success so the endpoint
// can't be used to probe which emails are registered.
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    await limiter.consume(ip).catch(() => {});

    const { email } = await req.json();
    if (!email) throw new Error("email required");

    await connectDb();
    const user = await UserModel.findOne({
      email: { $regex: `^${String(email).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const link = `${env.APP_URL}/admin/reset-password?token=${token}`;
      await emailService
        .send({
          to: user.email,
          subject: "Reset your SerenArt admin password",
          text: `Hi ${user.name},\n\nUse this link to set a new password (it works for one hour):\n\n${link}\n\nIf you didn't ask for this, you can ignore this email.\n\n— SerenArt`,
        })
        .catch((e) => console.error("reset email failed", e));
    }

    return Response.json({
      success: true,
      data: { message: "If that email is on the team, a reset link is on its way." },
    });
  } catch (e) {
    return Response.json({ success: false, error: (e as Error).message }, { status: 400 });
  }
}
