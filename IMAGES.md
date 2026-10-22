# Image slots

Every photo/video slot on the site lives in `lib/images.ts`. Until a `src` is
filled in, the site renders a labelled placeholder with the correct aspect
ratio — so nothing shifts when you swap in real photos.

**How to add photos:** drop files in `/public/images/`, then set `src` on the
matching key in `lib/images.ts` (e.g. `src: "/images/hero-canvas.jpg"`).

| Key | Where it appears | Aspect | Suggested size |
|---|---|---|---|
| `hero.canvas` / `hero.karaoke` / `hero.picnic` | Homepage hero collage | 3/4 | 900×1200 |
| `whoWeAre.main` / `whoWeAre.offset` | Homepage "We're SerenArt" | 4/5 | 960×1200 |
| `moods.creative` / `.social` / `.outdoor` | Homepage mood cards | 4/3 | 1200×900 |
| `celebrate.private` / `.business` | Homepage celebrate cards | 4/3 | 1200×900 |
| `gallery.g1` … `g12` | Homepage proof strip + `/gallery` | mixed 3/4, 1/1, 4/3 | ~1200px wide |
| `experiences.*` | `/experiences` cards + detail pages | 4/3 (wide: 21/9) | 1200×900 |
| `privateBookings.hero` | Private bookings hero | 4/5 | 960×1200 |
| `privateBookings.*` | "What are you celebrating?" cards | 4/3 | 1200×900 |
| `business.hero`, `business.work1..3` | SerenArt Business | 4/3 | 1200×900 |
| `about.team1..3` | About page | 4/5 | 960×1200 |
| `logos.logo1..6` | "Brands we've worked with" | any (contained) | ~400×300, PNG/SVG |
| `eventFallback` | Event cards without a cover image | 4/3 | 1200×900 |

**Event covers** come from the admin image upload (Cloudinary) — `eventFallback`
is only used when an event has none.

**Gallery videos:** on any `gallery.gN` slot, set `video: "/images/clip.mp4"`
(and optionally `poster`) — it renders muted, looped, lazy-loaded.
