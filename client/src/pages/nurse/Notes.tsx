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
        title="Notes & Tasks"
        subtitle="Nursing notes and follow-up tasks."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <WorkspaceCard title="Patient Notes">
          <div className="space-y-3">
            {rows.slice(0, 5).map((v) => (
              <div key={v.id} className="rounded-xl border p-4">
                <b>{v.patient.name}</b>
                <p className="mt-1 text-sm text-[#596274]">
                  {v.notes || "No note recorded."}
                </p>
              </div>
            ))}
          </div>
        </WorkspaceCard>
        <WorkspaceCard title="Task List">
          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-xl border p-4">
              <input type="checkbox" />{" "}
              <span>
                <b>Prepare medication</b>
                <small className="block text-xs text-[#7b8497]">
                  Coordinate with pharmacy
                </small>
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border p-4">
              <input type="checkbox" defaultChecked />{" "}
              <span>
                <b>Follow-up check</b>
                <small className="block text-xs text-[#7b8497]">
                  Review completed vitals
                </small>
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border p-4">
              <input type="checkbox" />{" "}
              <span>
                <b>Prepare room</b>
                <small className="block text-xs text-[#7b8497]">
                  Before next patient
                </small>
              </span>
            </label>
          </div>
        </WorkspaceCard>
      </div>
    </>
  );
}
