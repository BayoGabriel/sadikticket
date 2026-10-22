import { PageHeader, Breadcrumbs } from "@/components/admin/ui/PageHeader";
import { EventForm } from "@/components/admin/events/EventForm";
import { settingsService } from "@/services/settingsService";
import { connectDb } from "@/lib/db";
import { FaqModel } from "@/models/faq";
import { faqs as fallbackFaqs } from "@/lib/faqs";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  await connectDb();
  const [dbFaqs, settings] = await Promise.all([
    FaqModel.find({ published: true }).sort({ order: 1 }).lean().catch(() => []),
    settingsService.getPublic().catch(() => ({ cities: ["Lagos", "Benin City"] })),
  ]);
  const faqs = dbFaqs.length
    ? dbFaqs.map((f) => ({ id: String(f._id), question: f.question }))
    : fallbackFaqs.map((f) => ({ id: f.id, question: f.q }));

  return (
    <div>
      <Breadcrumbs items={[{ label: "Events", href: "/admin/events" }, { label: "New event" }]} />
      <PageHeader title="New event" subtitle="Fill it in, watch the preview on the right, publish when it's ready." />
      <EventForm initial={{}} faqs={faqs} cities={settings.cities ?? ["Lagos", "Benin City"]} />
    </div>
  );
}
