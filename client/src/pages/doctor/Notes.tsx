import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import WorkspaceCard from "../../components/common/WorkspaceCard";
import { clinic, unwrap } from "../../services/clinicService";
export default function Notes() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    clinic.visits().then((r) => setRows(unwrap(r)));
  }, []);
  return (
    <>
      <PageHeader
        title="Medical Notes"
        subtitle="Review consultation notes and patient complaints."
      />
      <WorkspaceCard
        title="Consultation Notes"
        subtitle="Latest clinical notes"
      >
        <div className="space-y-3">
          {rows.map((v) => (
            <div key={v.id} className="rounded-xl border border-[#e6e3db] p-4">
              <div className="flex justify-between">
                <b>{v.patient.name}</b>
                <span className="text-xs text-[#7b8497]">Visit #{v.id}</span>
              </div>
              <p className="mt-2 text-sm text-[#596274]">
                {v.notes || "No medical note recorded yet."}
              </p>
              <p className="mt-2 text-xs text-[#168c9b]">
                Complaint: {v.complaint || "-"}
              </p>
            </div>
          ))}
        </div>
      </WorkspaceCard>
    </>
  );
}
