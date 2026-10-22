import { connectDb } from "@/lib/db";
import { AuditLogModel, type AuditLog } from "@/models/auditLog";
import type { AuthUser } from "@/lib/auth";

export type AuditInput = {
  actor?: AuthUser | null;
  action: string; // "event.published" | "order.refunded" | ...
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  detail?: Record<string, unknown>;
};

export const auditService = {
  // Fire-and-forget friendly — never throws, audit failure must not break ops.
  async record(input: AuditInput) {
    try {
      await connectDb();
      await AuditLogModel.create({
        actorId: input.actor ? input.actor.id : undefined,
        actorEmail: input.actor?.email,
        actorName: input.actor?.name,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        entityLabel: input.entityLabel,
        detail: input.detail,
      });
    } catch (e) {
      console.error("audit log failed", e);
    }
  },

  async list(opts: {
    q?: string;
    action?: string;
    entityType?: string;
    page?: number;
    limit?: number;
  }) {
    await connectDb();
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(100, opts.limit ?? 25);
    const filter: Record<string, unknown> = {};
    if (opts.action) filter.action = opts.action;
    if (opts.entityType) filter.entityType = opts.entityType;
    if (opts.q) {
      filter.$or = [
        { actorEmail: { $regex: opts.q, $options: "i" } },
        { actorName: { $regex: opts.q, $options: "i" } },
        { entityLabel: { $regex: opts.q, $options: "i" } },
        { action: { $regex: opts.q, $options: "i" } },
      ];
    }
    const [items, total] = await Promise.all([
      AuditLogModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<AuditLog[]>(),
      AuditLogModel.countDocuments(filter),
    ]);
    return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)) };
  },

  async recent(limit = 15) {
    await connectDb();
    return AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).lean<AuditLog[]>();
  },
};
