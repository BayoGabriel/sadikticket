import { Suspense } from "react";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { CheckInClient } from "@/components/admin/checkin/CheckInClient";

export const dynamic = "force-dynamic";

export default function CheckInPage() {
  return (
    <div className="checkin-mode">
      <PageHeader title="Check-in" subtitle="Scan tickets at the door. Works on your phone, even with a shaky signal." />
      <Suspense>
        <CheckInClient />
      </Suspense>
    </div>
  );
}
