import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import WorkspaceCard from "../../components/common/WorkspaceCard";
import { clinic, unwrap } from "../../services/clinicService";
export default function Diagnosis() {
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [name, setName] = useState("Flu & Cough");
  const [notes, setNotes] = useState("Rest and drink fluids");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    clinic.visits().then((r) => {
      const v = unwrap(r);
      setRows(v.filter((x: any) => x.status === "IN_CONSULTATION"));
      if (v.find((x: any) => x.status === "IN_CONSULTATION"))
        setSelected(v.find((x: any) => x.status === "IN_CONSULTATION"));
    });
  }, []);
  async function save() {
    if (!selected) return;
    try {
      await clinic.diagnosis({
        visitId: selected.id,
        diagnosisName: name,
        notes,
      });
      setMsg("Diagnosis saved successfully.");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Unable to save diagnosis.");
    }
  }
  return (
    <>
      <PageHeader
        title="Diagnosis"
        subtitle="Enter diagnosis using a simple clinical template."
      />
      <div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
        <WorkspaceCard
          title="Patient Queue"
          subtitle="Select a patient in consultation"
        >
          <div className="space-y-2">
            {rows.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                className={`w-full rounded-xl border p-4 text-left ${selected?.id === v.id ? "border-[#168c9b] bg-[#f0f8f8]" : "border-[#e6e3db]"}`}
              >
                <b>{v.patient.name}</b>
                <p className="mt-1 text-xs text-[#7b8497]">
                  {v.patient.age} years · {v.patient.gender}
                </p>
              </button>
            ))}
          </div>
        </WorkspaceCard>
        <WorkspaceCard
          title="Enter Diagnosis"
          subtitle={
            selected
              ? `Patient: ${selected.patient.name}`
              : "Select a patient first"
          }
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ad-input"
          />
          <label className="mt-5 block text-sm font-black">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="ad-input mt-2 min-h-36"
          />
          <button
            disabled={!selected}
            onClick={save}
            className="ad-btn ad-btn-primary mt-5 w-full"
          >
            Save Diagnosis
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
