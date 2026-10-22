// Data-driven FAQ list. Each event page shows the entries whose `topics`
// intersect the event's tags/type (first 3), falling back to `defaultIds`.
// Answers marked "[Your policy.]" are placeholders — fill in before launch.

export type Faq = {
  id: string;
  q: string;
  a: string;
  topics: string[]; // matched against event tags + eventType
};

export const faqs: Faq[] = [
  {
    id: "art-skill",
    q: "Do I need to be good at art?",
    a: "Not at all. Most people who come have never painted or made anything since school. Our hosts walk you through it step by step — the point is the vibe, not the masterpiece.",
    topics: ["painting", "pottery", "creative", "beginner-friendly"],
  },
  {
    id: "come-alone",
    q: "Can I come alone?",
    a: "Yes — plenty of people do. SerenArt is built for meeting people, and you'll be seated and chatting in minutes.",
    topics: ["social", "beginner-friendly"],
  },
  {
    id: "included",
    q: "What's included in my ticket?",
    a: "Everything you need for the activity plus the extras listed under \"What's included\" on the event page — typically all materials, an apron, a drink and a snack.",
    topics: ["painting", "pottery", "creative"],
  },
  {
    id: "byo",
    q: "Can I bring my own drinks or food?",
    a: "[Your policy.]",
    topics: ["picnic", "outdoor"],
  },
  {
    id: "age-limit",
    q: "Is there an age limit?",
    a: "[Your policy.] Most experiences are 18+ — family-friendly sessions are marked on the event page.",
    topics: [],
  },
  {
    id: "refund",
    q: "Can I get a refund?",
    a: "[Your policy.] Read the full policy on our Refunds and Cancellations page.",
    topics: [],
  },
  {
    id: "late",
    q: "What if I'm running late?",
    a: "[Your policy.]",
    topics: [],
  },
  {
    id: "private",
    q: "Can I book a private event for my group?",
    a: "Yes — birthdays, showers, hangouts, date nights and more. Head to Private Bookings, tell us what you're planning and we'll reach out to talk it through.",
    topics: ["good-for-groups", "evening"],
  },
  {
    id: "corporate",
    q: "Do you do events for companies?",
    a: "We do — team bonding days, retreats, wellness sessions and brand activations through SerenArt Business. Tell us about your team and we'll put a proposal together.",
    topics: ["good-for-groups"],
  },
];

// Shown on event pages when nothing matches more specifically.
export const defaultFaqIds = ["art-skill", "come-alone", "included"];

export function faqsForEvent(tags: string[], limit = 3): Faq[] {
  const matched = faqs.filter((f) => f.topics.some((t) => tags.includes(t)));
  const defaults = defaultFaqIds
    .map((id) => faqs.find((f) => f.id === id))
    .filter((f): f is Faq => Boolean(f));
  const merged = [...matched, ...defaults];
  const seen = new Set<string>();
  return merged
    .filter((f) => (seen.has(f.id) ? false : (seen.add(f.id), true)))
    .slice(0, limit);
}
