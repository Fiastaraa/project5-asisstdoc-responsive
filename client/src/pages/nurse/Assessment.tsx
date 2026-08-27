import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import WorkspaceCard from "../../components/common/WorkspaceCard";
import { clinic, unwrap } from "../../services/clinicService";
export default function Assessment() {
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>();
  const [complaint, setComplaint] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    clinic.visits().then((r) => {
      const v = unwrap(r);
      setRows(v.filter((x: any) => x.status === "WAITING"));
    });
  }, []);
  return (
    <>
      <PageHeader
        title="Initial Assessment"
        subtitle="Record symptoms before the patient enters doctor consultation."
      />
      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <WorkspaceCard title="Waiting Patients">
          <div className="space-y-2">
            {rows.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelected(v);
                  setComplaint(v.complaint || "");
                }}
                className={`w-full rounded-xl border p-4 text-left ${selected?.id === v.id ? "border-[#168c9b] bg-[#f0f8f8]" : "border-[#e6e3db]"}`}
              >
                <b>{v.patient.name}</b>
                <p className="text-xs text-[#7b8497]">
                  {v.patient.age} years · {v.patient.gender}
                </p>
              </button>
            ))}
          </div>
        </WorkspaceCard>
        <WorkspaceCard title="Symptoms & Initial Assessment">
          <label className="text-sm font-black">Symptoms / Complaint</label>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            className="ad-input mt-2 min-h-40"
            placeholder="Describe the patient's symptoms..."
          />
          <button
            disabled={!selected}
            onClick={async () => {
              if (selected) {
                await clinic.vitals(selected.id, { notes: complaint });
                setMsg("Assessment saved.");
              }
            }}
            className="ad-btn ad-btn-primary mt-5 w-full"
          >
            Save Assessment
          </button>
          {msg && (
            <p className="mt-3 rounded-xl bg-[#e5f6ed] p-3 text-sm font-semibold text-[#21704b]">
              {msg}
            </p>
          )}
        </WorkspaceCard>
      </div>
    </>
  );
}
