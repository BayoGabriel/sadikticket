import { connectDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { EnquiryModel, type Enquiry, type EnquiryStage } from "@/models/enquiry";
import { Types } from "mongoose";
import type { AuthUser } from "@/lib/auth";

// The inbox only shows real enquiries — waitlist/updates signups live in
// their own screens.
const INBOX_KINDS = ["private-booking", "business", "general"];

export type EnquiryRow = Enquiry & { ageHours: number };

export const enquiryPipelineService = {
  async list(params: {
    tab?: string; // "all" | "private" | "business" | "general"
    stage?: string;
    city?: string;
    owner?: string;
    q?: string;
    from?: string;
    to?: string;
  }) {
    await connectDb();
    const filter: Record<string, unknown> = {
      kind: params.tab === "private" ? "private-booking" : params.tab === "business" ? "business" : params.tab === "general" ? "general" : { $in: INBOX_KINDS },
    };
    if (params.stage) filter.stage = params.stage;
    if (params.owner) filter.ownerId = new Types.ObjectId(params.owner);
    if (params.from || params.to) {
      filter.createdAt = {
        ...(params.from ? { $gte: new Date(params.from) } : {}),
        ...(params.to ? { $lte: new Date(`${params.to}T23:59:59`) } : {}),
      };
    }
    const and: Record<string, unknown>[] = [];
    if (params.city) and.push({ $or: [{ city: params.city }, { location: { $regex: params.city, $options: "i" } }] });
    if (params.q) {
      const rx = { $regex: params.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
      and.push({ $or: [{ name: rx }, { email: rx }, { phone: rx }, { company: rx }, { occasion: rx }, { message: rx }] });
    }
    if (and.length) filter.$and = and;
    const items = await EnquiryModel.find(filter).sort({ createdAt: -1 }).limit(500).lean<Enquiry[]>();
    const now = Date.now();
    return items.map((e) => ({ ...e, ageHours: Math.floor((now - new Date(e.createdAt).getTime()) / 3.6e6) }));
  },

  async counts() {
    await connectDb();
    const rows = await EnquiryModel.aggregate<{ _id: string; n: number }>([
      { $match: { kind: { $in: INBOX_KINDS } } },
      { $group: { _id: "$stage", n: { $sum: 1 } } },
    ]);
    return Object.fromEntries(rows.map((r) => [r._id, r.n]));
  },

  async update(
    id: string,
    patch: Partial<{
      stage: EnquiryStage;
      ownerId: string | null;
      ownerName: string | null;
      followUpAt: Date | null;
      quoteNaira: number | null;
      booking: { date?: string; venue?: string; priceNaira?: number | null };
      read: boolean;
    }>,
    _actor: AuthUser,
  ) {
    void _actor;
    await connectDb();
    const $set: Record<string, unknown> = {};
    const $unset: Record<string, unknown> = {};
    if (patch.stage) $set.stage = patch.stage;
    if (patch.read !== undefined) $set.read = patch.read;
    if (patch.ownerId !== undefined) {
      if (patch.ownerId) { $set.ownerId = new Types.ObjectId(patch.ownerId); $set.ownerName = patch.ownerName; }
      else { $unset.ownerId = ""; $unset.ownerName = ""; }
    }
    if (patch.followUpAt !== undefined) {
      if (patch.followUpAt) $set.followUpAt = patch.followUpAt; else $unset.followUpAt = "";
    }
    if (patch.quoteNaira !== undefined) {
      if (patch.quoteNaira != null) $set.quoteAmount = Math.round(patch.quoteNaira * 100);
      else $unset.quoteAmount = "";
    }
    if (patch.booking) {
      $set["booking.date"] = patch.booking.date;
      $set["booking.venue"] = patch.booking.venue;
      $set["booking.price"] = patch.booking.priceNaira != null ? Math.round(patch.booking.priceNaira * 100) : undefined;
    }
    const res = await EnquiryModel.updateOne({ _id: id }, { $set, ...(Object.keys($unset).length ? { $unset } : {}) });
    if (!res.matchedCount) throw new ApiError("NOT_FOUND", "Enquiry not found", 404);
    return true;
  },

  async addNote(id: string, text: string, actor: AuthUser) {
    await connectDb();
    const res = await EnquiryModel.updateOne(
      { _id: id },
      { $push: { notes: { text, author: actor.name, authorId: new Types.ObjectId(actor.id), createdAt: new Date() } } },
    );
    if (!res.matchedCount) throw new ApiError("NOT_FOUND", "Enquiry not found", 404);
    return true;
  },
};
