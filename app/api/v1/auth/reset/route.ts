import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { connectDb } from "@/lib/db";
import { UserModel } from "@/models/user";

// POST /api/v1/auth/reset  { token, password }
export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password || String(password).length < 8)
      throw new Error("Choose a password of at least 8 characters.");

    await connectDb();
    const hashed = crypto.createHash("sha256").update(String(token)).digest("hex");
    const user = await UserModel.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) throw new Error("That link has expired. Ask for a fresh one.");

    user.passwordHash = await bcrypt.hash(String(password), 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return Response.json({ success: true, data: { message: "Password updated. You can sign in now." } });
  } catch (e) {
    return Response.json({ success: false, error: (e as Error).message }, { status: 400 });
  }
}
