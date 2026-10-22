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

const Order =
  models.Order ||
  model("Order", new Schema({}, { timestamps: true, strict: false, collection: "orders" }));

const Ticket =
  models.Ticket ||
  model("Ticket", new Schema({}, { timestamps: true, strict: false, collection: "tickets" }));

const WaitlistEntry =
  models.WaitlistEntry ||
  model("WaitlistEntry", new Schema({}, { timestamps: true, strict: false, collection: "waitlistentries" }));

const Subscriber =
  models.Subscriber ||
  model("Subscriber", new Schema({}, { timestamps: true, strict: false, collection: "subscribers" }));

const Enquiry =
  models.Enquiry ||
  model("Enquiry", new Schema({}, { timestamps: true, strict: false, collection: "enquiries" }));

const SiteSettings =
  models.SiteSettings ||
  model("SiteSettings", new Schema({}, { timestamps: true, strict: false, collection: "sitesettings" }));

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

  // Owner account — set ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME in .env
  // (or pass real env vars). Never commit real credentials.
  // If ADMIN_* is provided and a seeded/default owner already exists, the
  // existing account is updated in place (no duplicate owners).
  const custom = Boolean(process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD);
  const ownerEmail = (process.env.ADMIN_EMAIL || "owner@serenart.local").toLowerCase();
  const ownerPassword = process.env.ADMIN_PASSWORD || "change-me";
  let admin = await User.findOne({ email: ownerEmail });
  if (!admin && custom) {
    // reseed run with real credentials: hijack the default/seeded owner
    admin =
      (await User.findOne({ email: "owner@serenart.local" })) ||
      (await User.findOne({ email: "admin@serenart.local" })) ||
      (await User.findOne({ role: "OWNER" }));
    if (admin) {
      admin.email = ownerEmail;
      if (process.env.ADMIN_NAME) admin.name = process.env.ADMIN_NAME;
      if (process.env.ADMIN_PASSWORD)
        admin.passwordHash = await bcrypt.hash(ownerPassword, 10);
      admin.role = "OWNER";
      admin.active = true;
      await admin.save();
      console.log(`OWNER updated in place: ${ownerEmail}`);
    }
  }
  if (!admin) {
    admin = await User.create({
      email: ownerEmail,
      name: process.env.ADMIN_NAME || "SerenArt Owner",
      passwordHash: await bcrypt.hash(ownerPassword, 10),
      role: "OWNER",
      active: true,
    });
    console.log(`Created OWNER: ${ownerEmail}${process.env.ADMIN_PASSWORD ? "" : " / change-me"}`);
  } else if (admin.email === ownerEmail && process.env.ADMIN_PASSWORD) {
    // same account, new password
    admin.passwordHash = await bcrypt.hash(ownerPassword, 10);
    if (process.env.ADMIN_NAME) admin.name = process.env.ADMIN_NAME;
    await admin.save();
    console.log(`OWNER password/name updated: ${ownerEmail}`);
  } else {
    console.log(`owner exists: ${ownerEmail}`);
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

  // Site settings — single doc, edited in /admin/settings.
  await SiteSettings.updateOne(
    { key: "main" },
    { $setOnInsert: { key: "main", cities: ["Lagos", "Benin City"], fewLeftThreshold: 10, stickyMobileBanner: true, responseTime: "within a day" } },
    { upsert: true },
  );
  console.log("site settings ready");

  // Sample orders + tickets on the first event so Orders/Attendees/Check-in
  // screens have realistic data. Marked [SAMPLE] — easy to spot and delete.
  const first = await Event.findOne({ name: "Sip and Paint Night" });
  if (first) {
    const tt = await TicketType.findOne({ eventId: first._id, name: "Single" });
    for (const [i, who] of ["Ada Sample", "Tunde Sample"].entries()) {
      const email = `sample-${i + 1}@example.com`;
      const exists = await Order.findOne({ customerEmail: email });
      if (exists) continue;
      const code = `SAMPLE-${i + 1}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      const order = await Order.create({
        eventId: first._id,
        customerName: who,
        customerEmail: email,
        customerPhone: "0800 000 0000",
        items: [{ ticketTypeId: tt._id, name: tt.name, unitPrice: tt.price, quantity: 1, currency: "NGN" }],
        subtotal: tt.price,
        fees: 0,
        total: tt.price,
        currency: "NGN",
        status: "PAID",
        paymentMethod: "cash",
        manual: true,
        soldBy: "Seed",
        paymentReference: `seed-${i + 1}-${Date.now()}`,
        notes: [{ text: "[SAMPLE] seeded data", author: "Seed" }],
      });
      await Ticket.create({
        orderId: order._id,
        eventId: first._id,
        ticketTypeId: tt._id,
        holderName: who,
        holderEmail: email,
        ticketCode: code,
        qrToken: `qr-${code}`,
        status: "ISSUED",
        emailStatus: "SENT",
        emailedAt: new Date(),
      });
    }
    console.log("sample orders + tickets seeded");
  }

  // Waitlist on the sold-out event.
  const soldOut = await Event.findOne({ name: "Pottery Saturday" });
  if (soldOut) {
    for (const w of [
      { name: "Seyi Sample", email: "waitlist-1@example.com" },
      { name: "Funmi Sample", email: "waitlist-2@example.com" },
    ]) {
      await WaitlistEntry.updateOne(
        { eventId: soldOut._id, email: w.email },
        { $setOnInsert: { ...w, eventId: soldOut._id, status: "waiting", seeded: true } },
        { upsert: true },
      );
    }
    console.log("sample waitlist seeded");
  }

  // Sample enquiries across the pipeline kinds.
  for (const e of [
    { kind: "private-booking", name: "Kemi Sample", email: "kemi@example.com", phone: "0800 111 1111", occasion: "birthday", guests: "12", date: "a Saturday next month", city: "Lagos", message: "[SAMPLE] Paint party for my sister's birthday." },
    { kind: "business", name: "Emeka Sample", email: "emeka@company.example", phone: "0800 222 2222", company: "[Company]", size: "30", service: "team bonding", frequency: "one-off", message: "[SAMPLE] End-of-quarter team day." },
    { kind: "general", name: "Tara Sample", email: "tara@example.com", message: "[SAMPLE] Do you ever run sessions for kids?" },
  ]) {
    await Enquiry.updateOne(
      { email: e.email, kind: e.kind },
      { $setOnInsert: { ...e, stage: "new", read: false, seeded: true } },
      { upsert: true },
    );
  }
  console.log("sample enquiries seeded");

  // Subscribers.
  for (const s of [
    { email: "sub-1@example.com", source: "footer", city: "Lagos" },
    { email: "sub-2@example.com", source: "empty-state", city: "Benin City" },
    { email: "sub-3@example.com", source: "waitlist", city: "Lagos" },
  ]) {
    await Subscriber.updateOne(
      { email: s.email, source: s.source },
      { $setOnInsert: { ...s, status: "subscribed", seeded: true } },
      { upsert: true },
    );
  }
  console.log("sample subscribers seeded");

  await mongoose.disconnect();
  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
