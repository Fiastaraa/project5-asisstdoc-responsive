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
      <PageHeader title="Schedule" subtitle="Today's consultation schedule." />
      <WorkspaceCard
        title="Today's Schedule"
        subtitle="Outpatient appointments"
      >
        <div className="space-y-3">
          {rows.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between rounded-xl border border-[#e6e3db] p-4"
            >
              <div>
                <b>
                  {new Date(v.visitDate).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </b>
                <p className="mt-1 text-sm font-black text-[#101a3d]">
                  {v.patient.name}
                </p>
                <p className="text-xs text-[#7b8497]">
                  {v.complaint || "General consultation"}
                </p>
              </div>
              <span className="rounded-lg bg-[#168c9b] px-3 py-2 text-xs font-black text-white">
                View
              </span>
            </div>
          ))}
        </div>
      </WorkspaceCard>
    </>
  );
}
