import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/response";
import { eventService } from "@/services/eventService";

// GET /api/v1/events/:slug (public event details)
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const ev = await eventService.getPublicBySlug(slug);
    return ok({
      id: ev._id.toString(),
      name: ev.name,
      slug: ev.slug,
      shortDescription: ev.shortDescription,
      description: ev.description,
      includes: ev.includes ?? [],
      tags: ev.tags ?? [],
      eventType: ev.eventType,
      directions: ev.directions,
      mapLink: ev.mapLink,
      gallery: ev.gallery ?? [],
      statusOverride: ev.statusOverride,
      coverImage: ev.coverImage,
      venueName: ev.venueName,
      venueAddress: ev.venueAddress,
      city: ev.city,
      state: ev.state,
      country: ev.country,
      startsAt: ev.startsAt,
      endsAt: ev.endsAt,
      timezone: ev.timezone,
    });
  } catch (e: any) {
    return fail(e);
  }
}
