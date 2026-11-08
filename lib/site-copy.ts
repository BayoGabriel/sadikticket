// Registry of every admin-editable text and image on the public site.
// `default` is what ships in code — the Site copy admin page lets the team
// override any of it; missing rows fall back to these defaults.

export type SiteCopyField = {
  key: string;
  group: string; // admin grouping
  label: string;
  kind: "text" | "longtext" | "image";
  default: string;
};

const f = (
  key: string,
  group: string,
  label: string,
  def: string,
  kind: SiteCopyField["kind"] = "text",
): SiteCopyField => ({ key, group, label, kind, default: def });

export const siteCopyFields: SiteCopyField[] = [
  // ── Homepage ────────────────────────────────────────────────────────────
  f("home.hero.title", "Home · Hero", "Headline", "Life's Too Short for Boring Plans."),
  f("home.hero.sub", "Home · Hero", "Subtext", "Create art, vibe to your favourite playlists, meet your people and have a good time, with absolutely no pressure to be Picasso.", "longtext"),
  f("home.hero.cta1", "Home · Hero", "Primary button", "View Upcoming Event"),
  f("home.hero.cta2", "Home · Hero", "Secondary button", "Plan A Private Experience"),
  f("home.ticker.items", "Home · Hero", "Ticker items (comma-separated)", "Painting, Clay, Karaoke, Picnics, Games & Trivia, RnB Parties, Birthdays, Team Bonding", "longtext"),
  f("img.home.hero.canvas", "Home · Hero", "Collage photo 1", "", "image"),
  f("img.home.hero.karaoke", "Home · Hero", "Collage photo 2", "", "image"),
  f("img.home.hero.picnic", "Home · Hero", "Collage photo 3", "", "image"),

  f("home.serenart.title", "Home · We're SerenArt", "Heading", "We're SerenArt."),
  f("home.serenart.p1", "Home · We're SerenArt", "Paragraph 1", "We believe life should be about more than routines. It's about trying something new, meeting people, expressing yourself and creating moments worth remembering.", "longtext"),
  f("home.serenart.p2", "Home · We're SerenArt", "Paragraph 2", "From creative workshops and social events to personalised celebrations and corporate experiences, we create spaces where people can connect, unwind and have a genuinely good time.", "longtext"),
  f("home.serenart.cta", "Home · We're SerenArt", "Button", "Explore Experiences"),
  f("img.home.whoweare.main", "Home · We're SerenArt", "Photo 1", "", "image"),
  f("img.home.whoweare.offset", "Home · We're SerenArt", "Photo 2", "", "image"),

  f("home.events.title", "Home · Upcoming events", "Heading", "Upcoming Events"),
  f("home.events.link", "Home · Upcoming events", "Link label", "See all events"),

  f("home.celebrate.title", "Home · Celebrate", "Heading", "Got something to celebrate? Make It a Whole Vibe."),
  f("home.celebrate.private.title", "Home · Celebrate", "Private card title", "Private Bookings."),
  f("home.celebrate.private.body", "Home · Celebrate", "Private card body", "Birthday, bridal shower, Friendship hangout. Tell us the plan and we'll make it happen.", "longtext"),
  f("home.celebrate.private.cta", "Home · Celebrate", "Private card button", "Plan my party"),
  f("home.celebrate.business.title", "Home · Celebrate", "Business card title", "SerenArt Business."),
  f("home.celebrate.business.tag", "Home · Celebrate", "Business card tagline", "Team bonding people actually want to show up for."),
  f("home.celebrate.business.body", "Home · Celebrate", "Business card body", "From creative team sessions and staff celebrations to retreats and brand experiences, we help companies bring people together in ways they'll actually enjoy.", "longtext"),
  f("home.celebrate.business.cta", "Home · Celebrate", "Business card button", "Book a team experience"),
  f("img.home.celebrate.private", "Home · Celebrate", "Private card photo", "", "image"),
  f("img.home.celebrate.business", "Home · Celebrate", "Business card photo", "", "image"),

  f("home.moods.title", "Home · Moods", "Heading", "What are you in the mood for?"),
  f("home.moods.1.title", "Home · Moods", "Card 1 title", "Creative Experiences"),
  f("home.moods.1.body", "Home · Moods", "Card 1 body", "Canvas Painting, Clay Painting, Gypsum Art.."),
  f("home.moods.2.title", "Home · Moods", "Card 2 title", "Social Experiences"),
  f("home.moods.2.body", "Home · Moods", "Card 2 body", "Karaoke, games, trivia, Mixers…"),
  f("home.moods.3.title", "Home · Moods", "Card 3 title", "Outdoor Experiences"),
  f("home.moods.3.body", "Home · Moods", "Card 3 body", "Picnics, beach, retreats, outdoor games…"),
  f("home.moods.cta", "Home · Moods", "Button", "See everything we do"),
  f("img.home.moods.creative", "Home · Moods", "Card 1 photo", "", "image"),
  f("img.home.moods.social", "Home · Moods", "Card 2 photo", "", "image"),
  f("img.home.moods.outdoor", "Home · Moods", "Card 3 photo", "", "image"),

  f("home.steps.title", "Home · Steps", "Heading", "Easy, we promise"),
  f("home.steps.1.title", "Home · Steps", "Step 1 title", "Pick an event"),
  f("home.steps.1.body", "Home · Steps", "Step 1 body", "Find one you like in your city."),
  f("home.steps.2.title", "Home · Steps", "Step 2 title", "Grab your ticket"),
  f("home.steps.2.body", "Home · Steps", "Step 2 body", "Pay online, get your ticket by email."),
  f("home.steps.3.title", "Home · Steps", "Step 3 title", "Show up"),
  f("home.steps.3.body", "Home · Steps", "Step 3 body", "We've got the setup. You bring the good mood."),

  f("home.shop.title", "Home · Shop", "Heading", "Shop"),
  f("home.shop.tagline", "Home · Shop", "Tagline", "Take the fun home. Creative kits, merch and gift sets."),
  f("home.shop.link", "Home · Shop", "Link label", "Visit the shop"),
  f("home.brands.title", "Home · Proof", "Brands heading", "Brands we've worked with"),
  f("home.reviews.title", "Home · Proof", "Reviews heading", "Don't take our word for it"),
  f("home.reviews.link", "Home · Proof", "Reviews link", "Read our reviews on Google"),

  f("home.cta.title", "Home · Last push", "Heading", "Ready? Let's make it a date."),
  f("home.cta.primary", "Home · Last push", "Primary button", "See upcoming events"),
  f("home.cta.secondary", "Home · Last push", "Secondary button", "Plan something with us"),

  // ── Events page ─────────────────────────────────────────────────────────
  f("events.title", "Events page", "Heading", "Upcoming events"),
  f("events.sub", "Events page", "Subtext", "Grab a ticket, bring a friend, come as you are."),

  // ── Shop page ───────────────────────────────────────────────────────────
  f("shop.title", "Shop page", "Heading", "Shop"),
  f("shop.tagline", "Shop page", "Tagline", "Take the fun home. Creative kits, merch and gift sets."),
  f("shop.cat1.name", "Shop page", "Category 1 name", "Creative kits"),
  f("shop.cat1.line", "Shop page", "Category 1 line", "Everything you need for a session at home — supplies, guide and good vibes included.", "longtext"),
  f("shop.cat2.name", "Shop page", "Category 2 name", "Merch"),
  f("shop.cat2.line", "Shop page", "Category 2 line", "Wear the vibe. Tees, totes and bits for people who'd rather be painting.", "longtext"),
  f("shop.cat3.name", "Shop page", "Category 3 name", "Gift sets"),
  f("shop.cat3.line", "Shop page", "Category 3 line", "For the person who has everything — except plans. Boxed and ready to give.", "longtext"),
  f("shop.empty", "Shop page", "Empty note", "New items land here first — check back soon."),
  f("img.shop.kits", "Shop page", "Category 1 photo", "", "image"),
  f("img.shop.merch", "Shop page", "Category 2 photo", "", "image"),
  f("img.shop.gifts", "Shop page", "Category 3 photo", "", "image"),
  f("shop.cta.title", "Shop page", "CTA heading", "Ready? Let's make it a date."),

  // ── Gallery page ────────────────────────────────────────────────────────
  f("gallery.title", "Gallery page", "Heading", "Gallery"),
  f("gallery.sub", "Gallery page", "Subtext", "Photos and short videos from past events. Real people, real mess, really good times.", "longtext"),
  f("gallery.cta.title", "Gallery page", "CTA heading", "Ready? Let's make it a date."),

  // ── Private bookings ────────────────────────────────────────────────────
  f("pb.hero.title", "Private bookings", "Hero heading", "Got something to celebrate? Make It a Whole Vibe."),
  f("pb.hero.sub", "Private bookings", "Hero subtext", "Birthdays, bridal showers, date nights, hangouts with the girls (or the boys). Tell us the plan and we'll help you pull it off.", "longtext"),
  f("pb.hero.cta1", "Private bookings", "Primary button", "Plan my event"),
  f("pb.hero.cta2", "Private bookings", "Secondary button", "Book a team bonding experience"),
  f("img.pb.hero", "Private bookings", "Hero photo", "", "image"),
  f("pb.occasions.title", "Private bookings", "Occasions heading", "What are you celebrating?"),
  f("pb.occasions.1.name", "Private bookings", "Occasion 1", "Birthdays"),
  f("pb.occasions.1.line", "Private bookings", "Occasion 1 line", "Another year, a better party."),
  f("pb.occasions.2.name", "Private bookings", "Occasion 2", "Bridal/Baby showers"),
  f("pb.occasions.2.line", "Private bookings", "Occasion 2 line", "Fun for the bride and everyone who loves her."),
  f("pb.occasions.3.name", "Private bookings", "Occasion 3", "Anniversaries"),
  f("pb.occasions.3.line", "Private bookings", "Occasion 3 line", "Something to do together that isn't just dinner."),
  f("pb.occasions.4.name", "Private bookings", "Occasion 4", "Friends' hangouts"),
  f("pb.occasions.4.line", "Private bookings", "Occasion 4 line", "Group chat plans, finally happening."),
  f("pb.occasions.5.name", "Private bookings", "Occasion 5", "Reunions"),
  f("pb.occasions.5.line", "Private bookings", "Occasion 5 line", "Get everyone in one room and give them something to do."),
  f("pb.occasions.6.name", "Private bookings", "Occasion 6", "Something else"),
  f("pb.occasions.6.line", "Private bookings", "Occasion 6 line", "Tell us the idea and we'll shape it."),
  f("img.pb.occasions.1", "Private bookings", "Occasion 1 photo", "", "image"),
  f("img.pb.occasions.2", "Private bookings", "Occasion 2 photo", "", "image"),
  f("img.pb.occasions.3", "Private bookings", "Occasion 3 photo", "", "image"),
  f("img.pb.occasions.4", "Private bookings", "Occasion 4 photo", "", "image"),
  f("img.pb.occasions.5", "Private bookings", "Occasion 5 photo", "", "image"),
  f("img.pb.occasions.6", "Private bookings", "Occasion 6 photo", "", "image"),
  f("pb.steps.title", "Private bookings", "Steps heading", "How it works"),
  f("pb.steps.1.title", "Private bookings", "Step 1 title", "Tell us what you're planning"),
  f("pb.steps.1.body", "Private bookings", "Step 1 body", "Fill in the short form with your date, group size and the kind of experience you like.", "longtext"),
  f("pb.steps.2.title", "Private bookings", "Step 2 title", "We chat"),
  f("pb.steps.2.body", "Private bookings", "Step 2 body", "We'll talk through the venue, the details and the budget until it feels right.", "longtext"),
  f("pb.steps.3.title", "Private bookings", "Step 3 title", "Lock it in"),
  f("pb.steps.3.body", "Private bookings", "Step 3 body", "Once you're happy, we confirm everything and you're set.", "longtext"),
  f("pb.form.title", "Private bookings", "Form heading", "Let's plan it!"),

  // ── Business ────────────────────────────────────────────────────────────
  f("biz.eyebrow", "Business page", "Eyebrow", "SerenArt Business"),
  f("biz.hero.title", "Business page", "Hero heading", "Your team deserves better than another meeting."),
  f("biz.hero.sub", "Business page", "Hero subtext", "Painting sessions, game days, staff parties and brand activations for companies that want their people, and their customers, to have a great time.", "longtext"),
  f("biz.hero.cta1", "Business page", "Primary button", "Plan a team experience"),
  f("biz.hero.cta2", "Business page", "Secondary button", "See our work"),
  f("img.biz.hero", "Business page", "Hero photo", "", "image"),
  f("biz.what.title", "Business page", "What we do heading", "What we do"),
  f("biz.what.1.title", "Business page", "Item 1 title", "Team bonding"),
  f("biz.what.1.body", "Business page", "Item 1 body", "Creative sessions, games and challenges, department socials. Good for new teams, old teams and teams that don't talk enough.", "longtext"),
  f("biz.what.2.title", "Business page", "Item 2 title", "Celebrations"),
  f("biz.what.2.body", "Business page", "Item 2 body", "End-of-year parties, staff appreciation, anniversaries and milestones.", "longtext"),
  f("biz.what.3.title", "Business page", "Item 3 title", "Retreats and wellness"),
  f("biz.what.3.body", "Business page", "Item 3 body", "Offsites, retreats, art and relaxation sessions, outdoor days.", "longtext"),
  f("biz.what.4.title", "Business page", "Item 4 title", "Brand experiences"),
  f("biz.what.4.body", "Business page", "Item 4 body", "Brand activations, launches, customer events and custom experiences for your audience.", "longtext"),
  f("biz.why.title", "Business page", "Why us heading", "Why companies pick us"),
  f("biz.why.items", "Business page", "Reasons (one per line)", "We start with what you want out of the day, then build around it.\nActivities that get everyone involved, not just the loud ones.\nBuilt around your team size, mood and budget.\nWe plan and run it, so you don't have to.\nA reason for people to talk to someone outside their usual circle.", "longtext"),
  f("biz.how.title", "Business page", "How we work heading", "How we work"),
  f("biz.how.1.title", "Business page", "Step 1 title", "Brief us"),
  f("biz.how.1.body", "Business page", "Step 1 body", "Tell us your goal, team size, date and rough budget."),
  f("biz.how.2.title", "Business page", "Step 2 title", "Get a proposal"),
  f("biz.how.2.body", "Business page", "Step 2 body", "We send ideas and a clear quote."),
  f("biz.how.3.title", "Business page", "Step 3 title", "We run the day"),
  f("biz.how.3.body", "Business page", "Step 3 body", "You turn up and enjoy it too."),
  f("biz.work.title", "Business page", "Clients heading", "Companies we've worked with"),
  f("biz.ways.title", "Business page", "Ways heading", "Ways to work with us"),
  f("biz.ways.1.name", "Business page", "Way 1 name", "One-off"),
  f("biz.ways.1.body", "Business page", "Way 1 body", "A single event or team day."),
  f("biz.ways.2.name", "Business page", "Way 2 name", "Regular"),
  f("biz.ways.2.body", "Business page", "Way 2 body", "Monthly or quarterly sessions for your team."),
  f("biz.ways.3.name", "Business page", "Way 3 name", "Custom"),
  f("biz.ways.3.body", "Business page", "Way 3 body", "A full programme built around your company."),
  f("biz.form.title", "Business page", "Form heading", "Tell us about your team"),

  // ── About page ──────────────────────────────────────────────────────────
  f("about.title", "About page", "Heading", "We're SerenArt."),
  f("about.p1", "About page", "Paragraph 1", "We believe life should be about more than routines. It's about trying something new, meeting people, expressing yourself and creating moments worth remembering.", "longtext"),
  f("about.p2", "About page", "Paragraph 2", "From creative workshops and social events to personalised celebrations and corporate experiences, we create spaces where people can connect, unwind and have a genuinely good time — in Lagos, Benin City, and wherever the vibe takes us next.", "longtext"),
  f("about.cta1", "About page", "Primary button", "Explore Experiences"),
  f("about.cta2", "About page", "Secondary button", "See upcoming events"),
  f("about.beliefs.title", "About page", "Beliefs heading", "What we believe"),
  f("about.beliefs.1.title", "About page", "Belief 1 title", "Fun is a skill"),
  f("about.beliefs.1.body", "About page", "Belief 1 body", "Most people aren't boring — they're just stuck in routines. We make it easy to break out of them.", "longtext"),
  f("about.beliefs.2.title", "About page", "Belief 2 title", "Everyone belongs"),
  f("about.beliefs.2.body", "About page", "Belief 2 body", "No experience needed, no coolness required. Come alone, come with your whole street.", "longtext"),
  f("about.beliefs.3.title", "About page", "Belief 3 title", "Show up as you are"),
  f("about.beliefs.3.body", "About page", "Belief 3 body", "Aprons for the messy bits, hosts for the nervous bits, good music for everything else.", "longtext"),
  f("about.cta.title", "About page", "CTA heading", "Ready? Let's make it a date."),
  f("about.cta.sub", "About page", "CTA subtext", "Public events in Lagos and Benin City, or a private experience planned just for your people.", "longtext"),
  f("img.about.team1", "About page", "Team photo 1", "", "image"),
  f("img.about.team2", "About page", "Team photo 2", "", "image"),

  // ── Contact + FAQs ──────────────────────────────────────────────────────
  f("contact.title", "Contact page", "Heading", "Say hi"),
  f("contact.sub", "Contact page", "Subtext", "Questions about an event, a private booking or working with us? We're easiest to reach on WhatsApp.", "longtext"),
  f("faqs.title", "FAQs page", "Heading", "FAQs"),
  f("faqs.sub", "FAQs page", "Subtext", "Quick answers. Anything else, ask us on WhatsApp."),

  // ── Footer ──────────────────────────────────────────────────────────────
  f("footer.tagline", "Footer", "Tagline", "Fun things to do with people, in Lagos and Benin City."),
  f("footer.newsletter", "Footer", "Newsletter line", "Get first access to upcoming experiences and special offers"),
  f("footer.newsletter.button", "Footer", "Newsletter button", "Keep me in the loop"),
];

export const siteCopyDefaults: Record<string, string> = Object.fromEntries(
  siteCopyFields.map((x) => [x.key, x.default]),
);

// Helpers for server pages: t() for text, im() to swap an ImageSlot's src.
export function copyGetter(map: Record<string, string>) {
  return (key: string) => map[key] ?? siteCopyDefaults[key] ?? "";
}
export function withSiteImage<T extends { src: string }>(
  slot: T,
  key: string,
  map: Record<string, string>,
): T {
  const src = map[key];
  return src ? { ...slot, src } : slot;
}
