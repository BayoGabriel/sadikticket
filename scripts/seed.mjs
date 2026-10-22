// Seed script — 6 dummy events covering every status state.
// Run: npm run seed  (uses MONGODB_URI from .env)
import { readFileSync } from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// tiny .env parser — avoids needing dotenv
try {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
  }
} catch {
  /* no .env — rely on real env vars */
}

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set");
  process.exit(1);
}

const { Schema, model, models } = mongoose;

const User =
  models.User ||
  model(
    "User",
    new Schema(
      {
        email: String,
        passwordHash: String,
        role: String,
        name: String,
      },
      { timestamps: true, strict: false },
    ),
  );

const Event =
  models.Event ||
  model(
    "Event",
    new Schema({}, { timestamps: true, strict: false, collection: "events" }),
  );

const TicketType =
  models.TicketType ||
  model(
    "TicketType",
    new Schema(
      {},
      { timestamps: true, strict: false, collection: "tickettypes" },
    ),
  );

const Review =
  models.Review ||
  model(
    "Review",
    new Schema({}, { timestamps: true, strict: false, collection: "reviews" }),
  );

const inDays = (d, hour = 18) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + d);
  dt.setHours(hour, 0, 0, 0);
  return dt;
};

const NG = "NGN";
const kobo = (n) => n * 100;

const seedEvents = [
  {
    name: "Sip and Paint Night",
    city: "Lagos",
    tags: ["painting", "evening", "beginner-friendly"],
    eventType: "painting",
    shortDescription:
      "Pick a canvas, pick a colour, follow along. Never held a brush? Perfect.",
    includes: ["Canvas", "Paint and brushes", "Apron", "Drink", "Snack"],
    tickets: [
      { name: "Single", price: kobo(15000), quantity: 60, sold: 12 },
      { name: "Couple", price: kobo(27000), quantity: 20, sold: 5 },
      { name: "Group of 4", price: kobo(50000), quantity: 10, sold: 2 },
    ],
    startsAt: inDays(9, 18),
  },
  {
    name: "Karaoke Night",
    city: "Lagos",
    tags: ["karaoke", "evening", "good-for-groups"],
    eventType: "karaoke",
    shortDescription:
      "You do not have to sing well. You just have to sing.",
    includes: ["Songbook access", "Mic time", "Drink", "Snack"],
    tickets: [{ name: "Single", price: kobo(8000), quantity: 80, sold: 71 }], // few left
    startsAt: inDays(14, 19),
  },
  {
    name: "Picnic, Paint and Play",
    city: "Benin City",
    tags: ["picnic", "outdoor", "painting", "good-for-groups"],
    eventType: "picnic",
    shortDescription: "Eat, paint and play games in one afternoon.",
    includes: ["Picnic setup", "Painting kit", "Games", "Food & drinks"],
    tickets: [{ name: "Single", price: kobo(20000), quantity: 40, sold: 6 }],
    startsAt: inDays(21, 13),
  },
  {
    name: "Pottery Saturday",
    city: "Benin City",
    tags: ["pottery", "creative", "beginner-friendly"],
    eventType: "pottery",
    shortDescription:
      "Get your hands in the clay and make something that is yours.",
    includes: ["Clay", "Tools", "Apron", "Firing", "Drink"],
    tickets: [{ name: "Single", price: kobo(18000), quantity: 24, sold: 24 }], // sold out
    startsAt: inDays(16, 11),
  },
  {
    name: "RnB and Paint",
    city: "Lagos",
    tags: ["painting", "rnb", "evening"],
    eventType: "painting",
    shortDescription:
      "Good music, a canvas and people you have not met yet.",
    includes: ["Canvas", "Paint and brushes", "Apron", "Drink", "Snack"],
    tickets: [
      {
        name: "Single",
        price: kobo(16000),
        quantity: 60,
        sold: 0,
        salesStart: inDays(4, 9), // coming soon
      },
    ],
    startsAt: inDays(30, 18),
  },
  {
    name: "Beach Day",
    city: "Lagos",
    tags: ["beach", "outdoor"],
    eventType: "beach",
    shortDescription: "Sand, games and a long afternoon with no plans.",
    includes: ["Beach setup", "Games", "Food & drinks"],
    tickets: [{ name: "Single", price: kobo(25000), quantity: 50, sold: 3 }],
    startsAt: inDays(35, 12),
  },
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");

  let admin = await User.findOne({ role: { $in: ["SUPER_ADMIN", "EVENT_ADMIN"] } });
  if (!admin) {
    admin = await User.create({
      email: "admin@serenart.local",
      name: "Seed Admin",
      passwordHash: await bcrypt.hash("change-me", 10),
      role: "SUPER_ADMIN",
    });
    console.log("Created seed admin: admin@serenart.local / change-me");
  }

  for (const ev of seedEvents) {
    const exists = await Event.findOne({ name: ev.name });
    if (exists) {
      console.log(`skip (exists): ${ev.name}`);
      continue;
    }
    const doc = await Event.create({
      createdBy: admin._id,
      name: ev.name,
      slug: ev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      shortDescription: ev.shortDescription,
      description: ev.shortDescription,
      includes: ev.includes,
      tags: ev.tags,
      eventType: ev.eventType,
      venueName: `[Venue name], ${ev.city}`,
      venueAddress: `[Address], ${ev.city}`,
      directions: "[How to get there, parking, landmark]",
      city: ev.city,
      country: "Nigeria",
      startsAt: ev.startsAt,
      endsAt: new Date(ev.startsAt.getTime() + 3 * 3600 * 1000),
      timezone: "Africa/Lagos",
      capacity: ev.tickets.reduce((s, t) => s + t.quantity, 0),
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    for (const t of ev.tickets) {
      await TicketType.create({
        eventId: doc._id,
        name: t.name,
        price: t.price,
        currency: NG,
        quantity: t.quantity,
        quantitySold: t.sold,
        salesStart: t.salesStart,
        status: "ACTIVE",
      });
    }
    console.log(`seeded: ${ev.name}`);
  }

  // Placeholder reviews — clearly marked, NOT approved, so nothing shows
  // publicly until real quotes replace them.
  for (const kind of ["guest", "guest", "client"]) {
    const context = kind === "client" ? "[Company], team day" : "[Event]";
    await Review.updateOne(
      { name: "[First name]", context },
      {
        $setOnInsert: {
          name: "[First name]",
          context,
          kind,
          text: "[A real review from a guest goes here, in their own words.]",
          approved: false,
        },
      },
      { upsert: true },
    );
  }
  console.log("seeded placeholder reviews (unapproved)");

  await mongoose.disconnect();
  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
