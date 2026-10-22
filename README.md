# SerenArt

Fun things to do with people, in Lagos and Benin City. Public events with ticketing, private bookings, and SerenArt Business — built on Next.js (App Router), TypeScript, Tailwind v4, MongoDB/Mongoose and Paystack.

## Setup

```bash
npm install
cp .env.example .env   # fill in the values — see below
npm run seed           # optional: owner account + demo events, orders, enquiries…
npm run dev
```

Open http://localhost:3000.

## Environment variables

All values are documented in `.env.example`. The important ones:

| Var | What it does |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `APP_URL` | Site origin — used for the Paystack callback URL, emails, sitemap. **Must be the real domain in production.** |
| `JWT_SECRET` | Signs the admin session cookie |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | Payment keys. Use **test** keys locally; **live** keys only in production env vars |
| `ENQUIRY_NOTIFY_EMAIL` | Where private/business/contact enquiries are emailed |
| `SMTP_*` / `EMAIL_FROM` | Outgoing mail (tickets, reminders, waitlist, enquiries) |
| `CLOUDINARY_*` | Admin event-image uploads |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_BUSINESS_EMAIL` / `NEXT_PUBLIC_INSTAGRAM_HANDLE` | Contact details shown on the site. The `NEXT_*` spellings (without `PUBLIC`) work too — `next.config.ts` maps them to `NEXT_PUBLIC_*` at build time |
| `CRON_SECRET` | Bearer secret for `GET /api/cron/reminders` (event reminder emails + stale-order sweep) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Used by `npm run seed` to create the Owner account. Set them *before* seeding |
| `PAYMENT_PROVIDER` | `paystack` (default). The provider layer lives in `services/payments/` so Flutterwave can be added |

### Paystack dashboard

- **Webhook URL:** `https://yourdomain.com/api/v1/webhooks/paystack` — required for payments to confirm
- **Callback URL:** `https://yourdomain.com/payment/callback` (also sent per-transaction from `APP_URL`)
- The order-status endpoint also verifies with Paystack directly, so a paid order still confirms even if the webhook is delayed or you're testing locally

## Admin guide

Log in at `/admin/login`. The very first account is created either via `/admin/bootstrap` (owner setup screen) or `npm run seed` with `ADMIN_EMAIL`/`ADMIN_PASSWORD` set. Everyone else is invited from **Settings → Team**.

**Roles** — Owner (everything) · Manager (everything except team/settings/emails/audit) · Events staff (events, orders, check-in, waitlist, coupons, enquiries) · Door staff (check-in only — lands on the door screen) · Content editor (content, reviews, subscribers).

| Area | What you can do |
|---|---|
| Dashboard | KPIs, sales chart, "needs attention" list, quick actions |
| Events | Create/edit with live preview + autosave, duplicate, publish/unpublish/archive, bulk actions, CSV |
| Orders & tickets | Order detail, refunds (Paystack + manual), resend ticket email, manual sales, transfer, re-verify pending payments, attendee list |
| Check-in | Phone-first door mode — camera QR scan, name/code search, offline queue, undo |
| Waitlist | Notify next N / all, freed-tickets banner, export |
| Coupons | Percent or fixed, event/ticket scoping, min order, limits, usage stats |
| Enquiries | One inbox for private + business — kanban or table, stages, notes, WhatsApp/call/email buttons, assign + follow-ups |
| Subscribers | List, source/city filters, export, branded announcement emails |
| Reviews | Guest + client reviews, approval + featured, permission-required |
| Content | Experiences, gallery/media library, FAQs, clients, policies & pages (versioned) |
| Settings | Contact details, enquiry recipients, policies, Paystack/storage/SMTP status |
| Emails | Edit every email template with live preview, send a test, enable/disable, email log + resend |
| Team | Invite by email, change role, deactivate (Owner only) |
| Activity log | Who did what, searchable |

**Publish an event:** `/admin/events/new` → fill Basics/When/Where/Photos/About/Tickets → the checklist ticks green → **Publish**. It appears on the homepage, `/events` and the city pages instantly — no redeploy.

**Money flow:** orders reserve seats atomically at checkout; failed/expired/cancelled orders release them. The reminders cron also sweeps stale pending orders. Refund from the order page — it updates capacity, emails the guest, and logs the audit trail.

## Editing content

Almost everything the site shows is editable in `/admin` now — **Experiences**, **Gallery & media**, **FAQs**, **Clients**, **Policies & pages**, **Site settings**. Public pages read the database first and fall back to the baked-in catalogues in `lib/` (`experiences.ts`, `faqs.ts`, `gallery.ts`, `site-config.ts`), so the site never breaks if the DB hiccups. First-time setup: open any content screen and hit **Load starter content**.

## Swapping in real photos

1. Drop files in `public/images/` (or `public/videos/` for gallery clips).
2. Fill in `src` in **`lib/images.ts`** — every slot on the site is listed there with `alt` and `aspect`.
3. See **`IMAGES.md`** for the recommended size/ratio of each slot.

Until a slot has a `src`, it renders a labelled tinted placeholder — nothing shifts when photos arrive.

## Payments & tickets

1. Guest picks tickets on `/events/[slug]` (optional coupon, server-validated) → `/events/[slug]/checkout`
2. `POST /api/v1/orders` creates the order (coupon discount applied server-side), then `POST /api/v1/payments/paystack/initialize` → redirect to Paystack
3. Paystack webhook (`/api/v1/webhooks/paystack`) verifies the signature + amount, marks the order PAID, issues tickets with QR codes, emails them
4. `/payment/callback` polls `/api/v1/orders/by-reference/[ref]/status` (which also verifies directly with Paystack as a fallback) → tickets at `/tickets/[orderId]`
5. `GET /api/cron/reminders` (Vercel Cron, see `vercel.json`) sends the "See you soon" email 2 days before paid events

Capacity is enforced atomically at payment time, so tickets can't oversell.

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run seed    # owner account + demo events/orders/enquiries/subscribers
npm run lint    # eslint
npm test        # vitest — coupon rules, event status, roles, sanitiser
```

## Deploy

Vercel — set all env vars there (live Paystack keys, real `APP_URL`, SMTP credentials), configure the Paystack webhook URL, and the cron in `vercel.json` runs automatically.
