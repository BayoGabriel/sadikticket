import { NextRequest } from "next/server";
import { z } from "zod";
import { requirePermission } from "@/lib/auth";
import { ok, fail } from "@/lib/response";
import { checkinService } from "@/services/checkinService";

// POST /api/v1/admin/check-in/undo  { token } — undo a mistaken check-in.
export async function POST(req: NextRequest) {
  try {
    const user = await requirePermission("checkin");
    const { token } = z.object({ token: z.string().min(1) }).parse(await req.json());
    const undone = await checkinService.undo(token, user);
    return ok({ undone });
  } catch (e: unknown) {
    return fail(e as Error);
  }
}
