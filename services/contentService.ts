import { connectDb } from "@/lib/db";
import { ExperienceModel, type Experience as ExperienceDoc } from "@/models/experience";
import { FaqModel, type Faq as FaqDoc } from "@/models/faq";
import { ClientModel, type Client } from "@/models/client";
import { MediaAssetModel, type MediaAsset } from "@/models/mediaAsset";
import { PageContentModel } from "@/models/pageContent";
import { experiences as staticExperiences, experienceImage as staticExperienceImage, type Experience, type ExperienceCategory } from "@/lib/experiences";
import { faqs as staticFaqs, type Faq } from "@/lib/faqs";
import { galleryItems as staticGallery, type GalleryItem, type GalleryType } from "@/lib/gallery";
import { type ImageSlot } from "@/lib/images";
import { Types } from "mongoose";

export type AdminExperience = Experience & {
  id: string;
  published: boolean;
  order: number;
  heroImage: string;
  gallery: string[];
  eventType: string;
  seeded?: boolean;
};

function slotFromUrl(url: string, alt: string, fallback: ImageSlot): ImageSlot {
  if (!url) return fallback;
  return { ...fallback, src: url, alt: alt || fallback.alt };
}

// ── Experiences ─────────────────────────────────────────────────────────────

function docToExperience(d: ExperienceDoc): Experience {
  return {
    slug: d.slug,
    name: d.name,
    category: d.category as ExperienceCategory,
    oneLiner: d.oneLiner,
    whatItIs: (d.whatItIs || "").split(/\n{2,}/).filter(Boolean),
    whatToExpect: d.whatToExpect ?? [],
    whoItSuits: d.whoItSuits ?? [],
    addons: d.addOns ?? [],
    eventTags: (d.eventTags?.length ? d.eventTags : [d.eventType].filter(Boolean)) as string[],
    wide: d.wide,
  };
}

export const contentService = {
  // Public read — DB rows when they exist, static catalogue otherwise.
  async experiences(): Promise<{ items: Experience[]; images: Record<string, ImageSlot> }> {
    try {
      await connectDb();
      const docs = await ExperienceModel.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean<ExperienceDoc[]>();
      if (!docs.length) throw new Error("empty");
      const items = docs.map(docToExperience);
      const imgs: Record<string, ImageSlot> = {};
      for (const d of docs) imgs[d.slug] = slotFromUrl(d.heroImage, d.name, staticExperienceImage(d.slug));
      return { items, images: imgs };
    } catch {
      const imgs: Record<string, ImageSlot> = {};
      for (const e of staticExperiences) imgs[e.slug] = staticExperienceImage(e.slug);
      return { items: staticExperiences, images: imgs };
    }
  },

  // Admin read — every row regardless of publish state; falls back to
  // showing the static catalogue as un-seeded drafts so the admin has
  // something to edit before the seed runs.
  async adminExperiences(): Promise<AdminExperience[]> {
    try {
      await connectDb();
      const docs = await ExperienceModel.find().sort({ order: 1, createdAt: 1 }).lean<ExperienceDoc[]>();
      if (docs.length) {
        return docs.map((d) => ({ ...docToExperience(d), id: String(d._id), published: d.published, order: d.order, heroImage: d.heroImage, gallery: d.gallery ?? [], eventType: d.eventType ?? "", seeded: d.seeded }));
      }
    } catch { /* fall through to static */ }
    return staticExperiences.map((e) => ({ ...e, id: "", published: true, order: 0, heroImage: "", gallery: [], eventType: "" }));
  },

  async saveExperience(id: string | null, input: Partial<ExperienceDoc>) {
    await connectDb();
    if (id && Types.ObjectId.isValid(id)) {
      const res = await ExperienceModel.updateOne({ _id: id }, { $set: input });
      if (!res.matchedCount) throw new Error("Experience not found");
      return id;
    }
    const doc = await ExperienceModel.create(input);
    return String(doc._id);
  },

  async reorder(ids: string[]) {
    await connectDb();
    await Promise.all(ids.map((id, i) => Types.ObjectId.isValid(id) && ExperienceModel.updateOne({ _id: id }, { $set: { order: i } })));
  },

  async deleteExperience(id: string) {
    await connectDb();
    await ExperienceModel.deleteOne({ _id: id });
  },

  // ── FAQs ──────────────────────────────────────────────────────────────────
  async faqs(): Promise<(Faq & { onEventPages?: boolean })[]> {
    try {
      await connectDb();
      const docs = await FaqModel.find({ published: true }).sort({ priority: -1, order: 1, createdAt: 1 }).lean<FaqDoc[]>();
      if (!docs.length) throw new Error("empty");
      return docs.map((d) => ({ id: String(d._id), q: d.question, a: d.answer, topics: d.topics ?? [], onEventPages: d.showOnEventPages }));
    } catch {
      return staticFaqs.map((f) => ({ ...f, onEventPages: true }));
    }
  },

  async adminFaqs(): Promise<(FaqDoc & { id: string })[]> {
    try {
      await connectDb();
      const docs = await FaqModel.find().sort({ order: 1, createdAt: 1 }).lean<FaqDoc[]>();
      if (docs.length) return docs.map((d) => ({ ...d, id: String(d._id) }));
    } catch { /* fall through */ }
    // Static catalogue as un-seeded rows so the admin can edit immediately.
    return staticFaqs.map((f, i) => ({
      _id: new Types.ObjectId(),
      id: "",
      question: f.q,
      answer: f.a,
      category: "General",
      topics: f.topics,
      showOnEventPages: true,
      priority: 0,
      order: i,
      published: true,
      needsAnswer: f.a.includes("[Your"),
      seeded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as (FaqDoc & { id: string })[];
  },

  // Same matching rules as lib/faqs — DB answers first, static as fallback.
  async faqsForEvent(tags: string[], limit = 3): Promise<Faq[]> {
    const all = await this.faqs();
    // Only FAQs allowed on event pages, topic-matched first (priority order
    // is already applied by faqs()).
    const eligible = all.filter((f) => f.onEventPages !== false);
    const matched = eligible.filter((f) => f.topics.some((t) => tags.includes(t)));
    const seen = new Set<string>();
    const merged = [...matched, ...eligible];
    return merged.filter((f) => (seen.has(f.id) ? false : (seen.add(f.id), true))).slice(0, limit);
  },

  // ── Gallery ───────────────────────────────────────────────────────────────
  async galleryItems(): Promise<GalleryItem[]> {
    try {
      await connectDb();
      const docs = await MediaAssetModel.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean<MediaAsset[]>();
      if (!docs.length) throw new Error("empty");
      return docs.map((d) => ({
        key: String(d._id),
        type: ((d.tags?.[0] ?? "painting") as GalleryType),
        tall: (d.height ?? 0) > (d.width ?? 1) * 1.2,
        slot: {
          src: d.kind === "video" ? (d.poster || "") : d.url,
          alt: d.alt || "SerenArt event",
          aspect: "4/3",
          label: `${d.kind === "video" ? "VIDEO" : "PHOTO"} · ${(d.tags?.[0] ?? "SERENART").toUpperCase()}`,
          video: d.kind === "video" ? d.url : undefined,
          poster: d.poster || undefined,
        },
      }));
    } catch {
      return staticGallery;
    }
  },

  async adminMedia(): Promise<(MediaAsset & { id: string; usedIn: string[] })[]> {
    await connectDb();
    const { EventModel } = await import("@/models/event");
    const [docs, events, exps] = await Promise.all([
      MediaAssetModel.find().sort({ order: 1, createdAt: 1 }).lean<MediaAsset[]>(),
      EventModel.find().select({ name: 1, coverImage: 1 }).lean<{ _id: unknown; name: string; coverImage?: string }[]>(),
      ExperienceModel.find().select({ name: 1, heroImage: 1, gallery: 1 }).lean<ExperienceDoc[]>(),
    ]);
    const usage = (url: string) => {
      if (!url) return [];
      const places: string[] = [];
      for (const e of events) if (e.coverImage === url) places.push(`Event: ${e.name}`);
      for (const e of exps) {
        if (e.heroImage === url) places.push(`Experience: ${e.name}`);
        else if (e.gallery?.includes(url)) places.push(`Experience gallery: ${e.name}`);
      }
      return places;
    };
    return docs.map((d) => ({ ...d, id: String(d._id), usedIn: usage(d.url) }));
  },

  // ── Clients (SerenArt Business page) ──────────────────────────────────────
  async clients(): Promise<Client[]> {
    try {
      await connectDb();
      const docs = await ClientModel.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean<Client[]>();
      return docs;
    } catch {
      return [];
    }
  },

  // ── Editable pages (refunds, terms, privacy, about) ───────────────────────
  async page(key: string): Promise<{ content: string; lastUpdatedAt: Date | null } | null> {
    try {
      await connectDb();
      const doc = await PageContentModel.findOne({ key }).lean<{ content: string; lastUpdatedAt: Date } | null>();
      if (!doc?.content) return null;
      return { content: doc.content, lastUpdatedAt: doc.lastUpdatedAt ?? null };
    } catch {
      return null;
    }
  },

  async savePage(key: string, content: string, savedBy: string) {
    await connectDb();
    await PageContentModel.updateOne(
      { key },
      {
        $set: { key, content, lastUpdatedAt: new Date(), lastSavedBy: savedBy },
        $push: { versions: { $each: [{ content, savedBy, savedAt: new Date() }], $position: 0, $slice: 10 } },
      },
      { upsert: true },
    );
  },

  async pageVersions(key: string) {
    await connectDb();
    const doc = await PageContentModel.findOne({ key }).lean<{ versions: { content: string; savedBy?: string; savedAt: Date }[] } | null>();
    return doc?.versions ?? [];
  },

  async seedIfEmpty(): Promise<{ seeded: string[] }> {
    await connectDb();
    const done: string[] = [];
    if ((await ExperienceModel.estimatedDocumentCount()) === 0) {
      await ExperienceModel.insertMany(
        staticExperiences.map((e, i) => ({
          slug: e.slug,
          name: e.name,
          category: e.category,
          oneLiner: e.oneLiner,
          whatItIs: e.whatItIs.join("\n\n"),
          whatToExpect: e.whatToExpect,
          whoItSuits: e.whoItSuits,
          addOns: e.addons,
          eventTags: e.eventTags,
          wide: e.wide ?? false,
          order: i,
          published: true,
          seeded: true,
        })),
      );
      done.push("experiences");
    }
    if ((await FaqModel.estimatedDocumentCount()) === 0) {
      await FaqModel.insertMany(
        staticFaqs.map((f, i) => ({
          question: f.q,
          answer: f.a,
          topics: f.topics,
          showOnEventPages: true,
          order: i,
          published: true,
          needsAnswer: f.a.includes("[Your"),
          seeded: true,
        })),
      );
      done.push("faqs");
    }
    if ((await MediaAssetModel.estimatedDocumentCount()) === 0) {
      await MediaAssetModel.insertMany(
        staticGallery.map((g, i) => ({
          kind: g.slot.video !== undefined ? "video" : "photo",
          url: g.slot.video ?? g.slot.src ?? "",
          poster: g.slot.poster ?? "",
          alt: g.slot.alt,
          tags: [g.type],
          order: i,
          published: true,
          seeded: true,
        })),
      );
      done.push("media");
    }
    return { seeded: done };
  },
};
