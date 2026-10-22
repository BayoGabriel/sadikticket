import { connectDb } from "@/lib/db";
import { SiteSettingsModel, type SiteSettings } from "@/models/siteSettings";

// Public site settings — DB-backed with a short in-memory cache. Public pages
// are dynamically rendered, so a save + revalidatePath is enough for changes to
// appear immediately; the cache just avoids a DB hit per request.
const CACHE_TTL_MS = 30_000;
let cache: { at: number; value: SiteSettings } | null = null;

export function bustSettingsCache() {
  cache = null;
}

export const DEFAULTS = {
  whatsappNumber: "",
  contactEmail: "",
  businessEmail: "",
  instagramHandle: "",
  enquiryNotifyEmails: [] as string[],
  responseTime: "within a day",
  cities: ["Lagos", "Benin City"],
  fewLeftThreshold: 10,
  stickyMobileBanner: true,
  announcementEnabled: false,
  announcementText: "",
  refundSummary: "[Your refund policy.]",
};

export const settingsService = {
  async get(): Promise<SiteSettings> {
    const now = Date.now();
    if (cache && now - cache.at < CACHE_TTL_MS) return cache.value;
    await connectDb();
    let doc = await SiteSettingsModel.findOne({ key: "main" }).lean<SiteSettings | null>();
    if (!doc) {
      doc = (await SiteSettingsModel.create({ key: "main" })).toObject() as SiteSettings;
    }
    cache = { at: now, value: doc };
    return doc;
  },

  async update(input: Partial<Omit<SiteSettings, "_id" | "key">>) {
    await connectDb();
    const doc = await SiteSettingsModel.findOneAndUpdate(
      { key: "main" },
      { $set: input },
      { upsert: true, new: true },
    ).lean<SiteSettings>();
    bustSettingsCache();
    return doc!;
  },

  // Merged view for public/server code: DB value wins when set, otherwise the
  // provided fallback (env/config default).
  async getPublic() {
    const s = await this.get();
    return {
      whatsappNumber: s.whatsappNumber || "",
      contactEmail: s.contactEmail || "",
      businessEmail: s.businessEmail || "",
      instagramHandle: s.instagramHandle || "",
      enquiryNotifyEmails: s.enquiryNotifyEmails ?? [],
      responseTime: s.responseTime || DEFAULTS.responseTime,
      cities: s.cities?.length ? s.cities : DEFAULTS.cities,
      fewLeftThreshold: s.fewLeftThreshold ?? DEFAULTS.fewLeftThreshold,
      stickyMobileBanner: s.stickyMobileBanner ?? true,
      announcementEnabled: s.announcementEnabled ?? false,
      announcementText: s.announcementText || "",
      refundSummary: s.refundSummary || DEFAULTS.refundSummary,
    };
  },
};
