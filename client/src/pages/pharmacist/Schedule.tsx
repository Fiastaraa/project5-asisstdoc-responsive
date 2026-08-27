import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import WorkspaceCard from "../../components/common/WorkspaceCard";
import { clinic, unwrap } from "../../services/clinicService";
export default function Schedule() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    clinic.visits().then((r) => setRows(unwrap(r)));
  }, []);
  return (
    <>
      <PageHeader
        title="Pharmacist Schedule"
        subtitle="Today's shift and operational schedule."
      />
      <WorkspaceCard title="Today's Shift">
        <div className="space-y-3">
          {[
            ["08:00 AM", "Opening & stock check"],
            ["10:00 AM", "Prescription preparation"],
            ["01:00 PM", "Inventory check"],
            ["03:00 PM", "Second shift handover"],
          ].map(([t, x]) => (
            <div
              key={t}
              className="flex items-center justify-between border-b border-[#eeeae2] py-4"
            >
              <div>
                <b>{t}</b>
                <p className="text-sm text-[#7b8497]">{x}</p>
              </div>
              <span className="rounded-lg bg-[#168c9b] px-3 py-2 text-xs font-black text-white">
                Shift
              </span>
            </div>
          ))}
          <p className="pt-3 text-xs text-[#7b8497]">
            Queue currently contains{" "}
            {rows.flatMap((v) => v.prescriptions || []).length} prescription
            items.
          </p>
        </div>
      </WorkspaceCard>
    </>
  );
}
