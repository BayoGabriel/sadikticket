# SerenArt

Fun things to do with people, in Lagos and Benin City. Public events with ticketing, private bookings, and SerenArt Business — built on Next.js (App Router), TypeScript, Tailwind v4, MongoDB/Mongoose and Paystack.

## Setup

```bash
npm install
cp .env.example .env   # fill in the values — see below
npm run seed           # optional: 6 dummy events across Lagos & Benin City
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
| `NEXT_PUBLIC_WHATSAPP_NUMBER` / `NEXT_PUBLIC_CONTACT_EMAIL` / `NEXT_PUBLIC_BUSINESS_EMAIL` / `NEXT_PUBLIC_INSTAGRAM_HANDLE` | Contact details shown on the site. Keep the `NEXT_PUBLIC_` prefix — client components read these |
| `CRON_SECRET` | Bearer secret for `GET /api/cron/reminders` (event reminder emails) |
| `PAYMENT_PROVIDER` | `paystack` (default). The provider layer lives in `services/payments/` so Flutterwave can be added |

### Paystack dashboard

- **Webhook URL:** `https://yourdomain.com/api/v1/webhooks/paystack` — required for payments to confirm
- **Callback URL:** `https://yourdomain.com/payment/callback` (also sent per-transaction from `APP_URL`)
- The order-status endpoint also verifies with Paystack directly, so a paid order still confirms even if the webhook is delayed or you're testing locally

## Admin

- Log in at `/admin/login` (first user via `/admin/bootstrap`)
- **Add an event:** `/admin/events/new` → fill the form → open the event → **Tickets** tab to add ticket types → **Publish**. It appears on `/events` and the homepage immediately — no redeploy.
- Also in admin: **Orders** (with CSV export), **Enquiries** (private/business/waitlist/subscribers, CSV), **Coupons** (create percent/fixed codes, per-event or global), **Reviews** (approve/hide/delete/add — homepage shows only approved ones), plus a **Notify waitlist** button on each event page.

## Editing content

| What | Where |
|---|---|
| Contact details, policies, response time | `lib/site-config.ts` (or `NEXT_PUBLIC_*` env vars) |
| FAQs (site list + per-event picks) | `lib/faqs.ts` |
| Experiences catalogue | `lib/experiences.ts` |
| Gallery items + type tags | `lib/gallery.ts` |
| Legal/policy pages | `app/refunds`, `app/terms`, `app/privacy` |

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
npm run seed    # 6 dummy events (Sip and Paint, Karaoke, Picnic, Pottery, RnB, Beach Day)
npm run lint    # eslint
```

## Deploy

Vercel — set all env vars there (live Paystack keys, real `APP_URL`, SMTP credentials), configure the Paystack webhook URL, and the cron in `vercel.json` runs automatically.
