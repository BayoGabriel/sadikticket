// Every image slot on the site, keyed by name. Drop real photos into
// /public/images and fill in `src` (e.g. "/images/hero-canvas.jpg").
// Until then <Img> renders a labelled placeholder with the right aspect
// ratio so nothing shifts when photos are swapped in.
// See IMAGES.md for recommended sizes.

export type ImageSlot = {
  src: string; // "" → placeholder
  alt: string;
  aspect: "1/1" | "4/3" | "3/4" | "16/9" | "21/9" | "4/5";
  label: string; // placeholder caption, e.g. "PHOTO · CANVAS PAINTING NIGHT"
  tint?: "peach" | "mint" | "green" | "orange" | "cream";
  video?: string; // optional mp4 src for gallery videos
  poster?: string;
};

const slot = (s: Omit<ImageSlot, "src" | "tint"> & { tint?: ImageSlot["tint"] }) =>
  ({ src: "", tint: "mint", ...s }) as ImageSlot;

const logo = (alt: string, src: string): ImageSlot => ({
  src,
  alt,
  aspect: "4/3",
  label: alt.toUpperCase(),
  tint: "cream",
});

export const images = {
  hero: {
    canvas: slot({ alt: "Guests painting at a canvas night", aspect: "3/4", label: "PHOTO · CANVAS PAINTING NIGHT", tint: "peach" }),
    karaoke: slot({ alt: "Karaoke night crowd", aspect: "3/4", label: "PHOTO · KARAOKE NIGHT", tint: "mint" }),
    picnic: slot({ alt: "Outdoor picnic with friends", aspect: "3/4", label: "PHOTO · PARK PICNIC", tint: "green" }),
  },
  whoWeAre: {
    main: slot({ alt: "SerenArt guests mid-activity", aspect: "4/5", label: "PHOTO · GUESTS PAINTING", tint: "peach" }),
    offset: slot({ alt: "Guests laughing together", aspect: "4/5", label: "PHOTO · LAUGHING TOGETHER", tint: "mint" }),
  },
  moods: {
    creative: slot({ alt: "Hands painting on canvas", aspect: "4/3", label: "PHOTO · GETTING CREATIVE", tint: "peach" }),
    social: slot({ alt: "Friends at a social night", aspect: "4/3", label: "PHOTO · SOCIAL NIGHT", tint: "green" }),
    outdoor: slot({ alt: "Picnic blanket outdoors", aspect: "4/3", label: "PHOTO · OUTDOOR DAY", tint: "orange" }),
  },
  celebrate: {
    private: slot({ alt: "Private birthday painting party", aspect: "4/3", label: "PHOTO · PRIVATE PARTY", tint: "peach" }),
    business: slot({ alt: "Company team day", aspect: "4/3", label: "PHOTO · TEAM DAY", tint: "green" }),
  },
  // Homepage proof strip (masonry) — gallery.1..n reused on /gallery too
  gallery: Object.fromEntries(
    Array.from({ length: 12 }, (_, i) => {
      const n = i + 1;
      const aspects = ["3/4", "1/1", "4/3"] as const;
      return [
        `g${n}`,
        slot({
          alt: `SerenArt gallery photo ${n}`,
          aspect: aspects[n % 3],
          label: `PHOTO · SERENART ${n}`,
          tint: (["peach", "mint", "green", "cream"] as const)[n % 4],
        }),
      ];
    }),
  ) as Record<string, ImageSlot>,

  experiences: {
    canvasPainting: slot({ alt: "Canvas painting session", aspect: "4/3", label: "PHOTO · CANVAS PAINTING", tint: "peach" }),
    clayHandBuilding: slot({ alt: "Clay hand building", aspect: "4/3", label: "PHOTO · CLAY HAND BUILDING", tint: "mint" }),
    gypsumArt: slot({ alt: "Gypsum art", aspect: "4/3", label: "PHOTO · GYPSUM ART", tint: "cream" }),
    customArt: slot({ alt: "Custom art experience", aspect: "21/9", label: "PHOTO · CUSTOM EXPERIENCE", tint: "orange" }),
    karaoke: slot({ alt: "Karaoke", aspect: "4/3", label: "PHOTO · KARAOKE", tint: "mint" }),
    gamesTrivia: slot({ alt: "Games and trivia", aspect: "4/3", label: "PHOTO · GAMES & TRIVIA", tint: "peach" }),
    rnbNights: slot({ alt: "RnB night", aspect: "4/3", label: "PHOTO · RNB NIGHT", tint: "green" }),
    themedSocials: slot({ alt: "Themed social", aspect: "4/3", label: "PHOTO · THEMED SOCIAL", tint: "cream" }),
    socialMixers: slot({ alt: "Social mixer", aspect: "4/3", label: "PHOTO · SOCIAL MIXER", tint: "orange" }),
    parkPicnics: slot({ alt: "Park picnic", aspect: "4/3", label: "PHOTO · PARK PICNIC", tint: "mint" }),
    beachDays: slot({ alt: "Beach day", aspect: "4/3", label: "PHOTO · BEACH DAY", tint: "peach" }),
    retreats: slot({ alt: "Retreat", aspect: "4/3", label: "PHOTO · RETREAT", tint: "green" }),
    outdoorSocials: slot({ alt: "Outdoor social", aspect: "21/9", label: "PHOTO · OUTDOOR SOCIALS", tint: "cream" }),
  },

  privateBookings: {
    hero: slot({ alt: "Private celebration", aspect: "4/5", label: "PHOTO · YOUR CELEBRATION", tint: "peach" }),
    birthdays: slot({ alt: "Birthday party", aspect: "4/3", label: "PHOTO · BIRTHDAY", tint: "mint" }),
    showers: slot({ alt: "Bridal or baby shower", aspect: "4/3", label: "PHOTO · SHOWER", tint: "peach" }),
    anniversaries: slot({ alt: "Anniversary celebration", aspect: "4/3", label: "PHOTO · ANNIVERSARY", tint: "cream" }),
    hangouts: slot({ alt: "Friends hangout", aspect: "4/3", label: "PHOTO · FRIENDS HANGOUT", tint: "green" }),
    reunions: slot({ alt: "Reunion", aspect: "4/3", label: "PHOTO · REUNION", tint: "orange" }),
    somethingElse: slot({ alt: "Any celebration", aspect: "4/3", label: "PHOTO · YOUR IDEA", tint: "mint" }),
  },

  // Shop (SerenFinds) — creative kits, merch and gift sets
  shop: {
    kits: slot({ alt: "SerenArt creative kit", aspect: "4/3", label: "PRODUCT · CREATIVE KIT", tint: "peach" }),
    merch: slot({ alt: "SerenArt merch", aspect: "4/3", label: "PRODUCT · MERCH", tint: "mint" }),
    gifts: slot({ alt: "SerenArt gift set", aspect: "4/3", label: "PRODUCT · GIFT SET", tint: "cream" }),
  },

  business: {
    hero: slot({ alt: "Corporate team experience", aspect: "4/3", label: "PHOTO · TEAM EXPERIENCE", tint: "green" }),
    work1: slot({ alt: "Client project one", aspect: "4/3", label: "PHOTO · CLIENT PROJECT", tint: "mint" }),
    work2: slot({ alt: "Client project two", aspect: "4/3", label: "PHOTO · CLIENT PROJECT", tint: "peach" }),
    work3: slot({ alt: "Client project three", aspect: "4/3", label: "PHOTO · CLIENT PROJECT", tint: "cream" }),
  },

  about: {
    team1: slot({ alt: "SerenArt team", aspect: "4/5", label: "PHOTO · THE TEAM", tint: "mint" }),
    team2: slot({ alt: "Behind the scenes", aspect: "4/5", label: "PHOTO · BEHIND THE SCENES", tint: "peach" }),
    team3: slot({ alt: "Event setup", aspect: "4/5", label: "PHOTO · EVENT SETUP", tint: "cream" }),
  },

  // Brand logos for "Brands we've worked with" — files live in /public/images/brands
  logos: {
    advad: logo("Advad", "/images/brands/advad.png"),
    andersen: logo("Andersen", "/images/brands/andersen.png"),
    ashcorp: logo("Ashcorp", "/images/brands/ashcorp.jpg"),
    belema: logo("Belema Fintech", "/images/brands/belema.jpg"),
    capitalfield: logo("Capitalfield", "/images/brands/capitalfield.png"),
    chiLimited: logo("Chi Limited", "/images/brands/chi-limited.jpg"),
    gtbank: logo("GTBank", "/images/brands/gtbank.webp"),
    internationalBreweries: logo("International Breweries", "/images/brands/international-breweries.jpg"),
    icsan: logo("ICSAN", "/images/brands/icsan.jpg"),
    krones: logo("Krones", "/images/brands/krones.png"),
    medcourt: logo("Medcourt", "/images/brands/medcourt.png"),
    nbc: logo("NBC", "/images/brands/nbc.jpg"),
    panAtlantic: logo("Pan-Atlantic University", "/images/brands/pan-atlantic-university.jpg"),
    pesa: logo("Pesa", "/images/brands/pesa.jpg"),
    piggyvest: logo("PiggyVest", "/images/brands/piggyvest.png"),
    sela: logo("Sela", "/images/brands/sela.jpg"),
  } as Record<string, ImageSlot>,

  // Fallback for events without a cover image
  eventFallback: slot({ alt: "SerenArt event", aspect: "4/3", label: "PHOTO · SERENART EVENT", tint: "mint" }),
};

export type ImageKey = keyof typeof images;
