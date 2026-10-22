// The SerenArt experience catalogue — drives /experiences and each
// /experiences/[slug] detail page. Copy is from the brief; "[...]" strings
// are one-line description placeholders to fill in.

import { images, type ImageSlot } from "@/lib/images";

export type ExperienceCategory = "creative" | "social" | "outdoor";

export type Experience = {
  slug: string;
  name: string;
  category: ExperienceCategory;
  oneLiner: string;
  whatItIs: string[];
  whatToExpect: string[];
  whoItSuits: string[];
  addons: string[];
  eventTags: string[]; // matched against event tags/type for "upcoming events of this type"
  wide?: boolean;
};

export const experienceCategories: Record<
  ExperienceCategory,
  { title: string; blurb: string; anchor: string }
> = {
  creative: {
    title: "Creative Activities",
    blurb: "Get creative. Get messy. Make something yours.",
    anchor: "creative",
  },
  social: {
    title: "Social Experience",
    blurb: "Good music, loud laughing, and people you haven't met yet.",
    anchor: "social",
  },
  outdoor: {
    title: "Outdoor Experience",
    blurb: "Take the fun outside",
    anchor: "outdoor",
  },
};

export const experiences: Experience[] = [
  {
    slug: "canvas-painting",
    name: "Canvas Painting",
    category: "creative",
    oneLiner: "Sip, paint, and take your canvas home.",
    whatItIs: [
      "A guided painting session where you create your own canvas piece — no experience needed.",
      "Our host walks the room through the painting step by step while music, drinks and conversation keep it loose.",
    ],
    whatToExpect: [
      "All materials provided — canvas, paints, brushes, apron",
      "A drink and a snack included in your ticket",
      "Around two hours, unhurried",
      "You take your canvas home",
    ],
    whoItSuits: ["Date night", "Birthdays", "Big groups", "Shy beginners"],
    addons: ["Extra drinks", "Custom playlist", "Cake or dessert table", "A second canvas"],
    eventTags: ["painting", "canvas-painting"],
  },
  {
    slug: "clay-hand-building",
    name: "Clay Hand Building",
    category: "creative",
    oneLiner: "Get your hands dirty and shape something real.",
    whatItIs: [
      "A relaxed pottery session where you hand-build your own piece — a cup, a bowl, whatever your hands decide.",
    ],
    whatToExpect: [
      "Clay, tools and apron provided",
      "Guidance from a host the whole way",
      "Your piece fired and ready to collect later",
    ],
    whoItSuits: ["Date night", "Birthdays", "Shy beginners", "Small groups"],
    addons: ["Glazing session", "Extra clay", "Private host"],
    eventTags: ["pottery", "clay-hand-building"],
  },
  {
    slug: "gypsum-art",
    name: "Gypsum Art",
    category: "creative",
    oneLiner: "Cast it, paint it, keep it.",
    whatItIs: [
      "Pour, mould and paint your own gypsum figures — surprisingly satisfying, very photogenic.",
    ],
    whatToExpect: [
      "Moulds, gypsum and paints provided",
      "Beginner-friendly from start to finish",
      "Take your pieces home the same day",
    ],
    whoItSuits: ["Birthdays", "Big groups", "Shy beginners", "Kids-at-heart"],
    addons: ["Extra figures", "Custom moulds", "Private host"],
    eventTags: ["gypsum", "gypsum-art"],
  },
  {
    slug: "custom-art-experience",
    name: "Custom Art Experience",
    category: "creative",
    oneLiner: "[One-line description.] Tell us what you're dreaming up and we'll build it.",
    whatItIs: [
      "[What it is.] A made-to-order creative session built around your group, theme or occasion.",
    ],
    whatToExpect: ["[What to expect.]"],
    whoItSuits: ["Big groups", "Birthdays", "Brand moments"],
    addons: ["[Add-on.]"],
    eventTags: ["custom"],
    wide: true,
  },
  {
    slug: "karaoke",
    name: "Karaoke",
    category: "social",
    oneLiner: "Grab the mic. Your people will sing the rest.",
    whatItIs: [
      "A proper karaoke night — a big songbook, a loud room, and zero judgement about your range.",
    ],
    whatToExpect: [
      "Thousands of songs, all eras and genres",
      "Group numbers encouraged",
      "Drinks and snacks available",
    ],
    whoItSuits: ["Friends' hangouts", "Birthdays", "Big groups", "Brave solo singers"],
    addons: ["Private room", "Dedicated host", "Themed song list"],
    eventTags: ["karaoke"],
  },
  {
    slug: "games-and-trivia",
    name: "Games & Trivia",
    category: "social",
    oneLiner: "Teams, bragging rights and very loud answers.",
    whatItIs: [
      "A hosted games and trivia night — teams, rounds, prizes and a lot of laughing at wrong answers.",
    ],
    whatToExpect: [
      "Hosted rounds — general knowledge, music, Naija culture",
      "Play in teams or get matched on the night",
      "Prizes for the winners",
    ],
    whoItSuits: ["Friends' hangouts", "Big groups", "Competitive couples"],
    addons: ["Custom trivia rounds", "Prizes for your group", "Private host"],
    eventTags: ["trivia", "games"],
  },
  {
    slug: "rnb-nights",
    name: "RnB Nights",
    category: "social",
    oneLiner: "[One-line description.] Slow jams, singalongs, maybe some paint.",
    whatItIs: [
      "[What it is.] An RnB-themed night — think your favourite slow jams, a crowd that knows every word, and an activity to keep your hands busy.",
    ],
    whatToExpect: ["[What to expect.]"],
    whoItSuits: ["Date night", "Friends' hangouts", "RnB lovers"],
    addons: ["[Add-on.]"],
    eventTags: ["rnb"],
  },
  {
    slug: "themed-socials",
    name: "Themed Socials",
    category: "social",
    oneLiner: "[One-line description.] Dress up, show up, get into it.",
    whatItIs: ["[What it is.]"],
    whatToExpect: ["[What to expect.]"],
    whoItSuits: ["Big groups", "Friends' hangouts"],
    addons: ["[Add-on.]"],
    eventTags: ["themed"],
  },
  {
    slug: "social-mixers",
    name: "Social Mixers",
    category: "social",
    oneLiner: "[One-line description.] Come solo, leave with people.",
    whatItIs: ["[What it is.]"],
    whatToExpect: ["[What to expect.]"],
    whoItSuits: ["Solo guests", "New in town", "Shy beginners"],
    addons: ["[Add-on.]"],
    eventTags: ["mixer"],
  },
  {
    slug: "park-picnics",
    name: "Park Picnics",
    category: "outdoor",
    oneLiner: "Blankets, baskets, games and sunshine.",
    whatItIs: [
      "A styled picnic in the park — we set it up, you just show up with your people.",
    ],
    whatToExpect: [
      "Full picnic setup — blankets, cushions, shade",
      "Food, drinks and lawn games",
      "Optional activity add-ons like painting",
    ],
    whoItSuits: ["Birthdays", "Date night", "Big groups", "Bridal showers"],
    addons: ["Paint-and-picnic combo", "Photographer", "Custom décor"],
    eventTags: ["picnic"],
  },
  {
    slug: "beach-days",
    name: "Beach Days",
    category: "outdoor",
    oneLiner: "[One-line description.] Sun, sand and the SerenArt treatment.",
    whatItIs: ["[What it is.]"],
    whatToExpect: ["[What to expect.]"],
    whoItSuits: ["Big groups", "Friends' hangouts", "Birthdays"],
    addons: ["[Add-on.]"],
    eventTags: ["beach"],
  },
  {
    slug: "retreats",
    name: "Retreats",
    category: "outdoor",
    oneLiner: "[One-line description.] A slower, softer kind of day out.",
    whatItIs: ["[What it is.]"],
    whatToExpect: ["[What to expect.]"],
    whoItSuits: ["Teams", "Wellness groups", "Big groups"],
    addons: ["[Add-on.]"],
    eventTags: ["retreat"],
  },
  {
    slug: "outdoor-socials",
    name: "Outdoor Socials",
    category: "outdoor",
    oneLiner: "[One-line description.] The whole vibe, but outside.",
    whatItIs: ["[What it is.]"],
    whatToExpect: ["[What to expect.]"],
    whoItSuits: ["Big groups", "New in town"],
    addons: ["[Add-on.]"],
    eventTags: ["outdoor"],
    wide: true,
  },
];

export function getExperience(slug: string): Experience | undefined {
  return experiences.find((e) => e.slug === slug);
}

export function experienceImage(slug: string): ImageSlot {
  const map: Record<string, ImageSlot> = {
    "canvas-painting": images.experiences.canvasPainting,
    "clay-hand-building": images.experiences.clayHandBuilding,
    "gypsum-art": images.experiences.gypsumArt,
    "custom-art-experience": images.experiences.customArt,
    karaoke: images.experiences.karaoke,
    "games-and-trivia": images.experiences.gamesTrivia,
    "rnb-nights": images.experiences.rnbNights,
    "themed-socials": images.experiences.themedSocials,
    "social-mixers": images.experiences.socialMixers,
    "park-picnics": images.experiences.parkPicnics,
    "beach-days": images.experiences.beachDays,
    retreats: images.experiences.retreats,
    "outdoor-socials": images.experiences.outdoorSocials,
  };
  return map[slug] ?? images.eventFallback;
}
