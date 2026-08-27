import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { clinic, unwrap } from "../../services/clinicService";
export default function Queue() {
  const [rows, setRows] = useState<any[]>([]);
  async function load() {
    const vs = unwrap(await clinic.visits());
    setRows(
      vs.flatMap((v: any) =>
        (v.prescriptions || []).map((r: any) => ({ ...r, patient: v.patient })),
      ),
    );
  }
  useEffect(() => {
    load();
  }, []);
  async function ready(id: number) {
    await clinic.prescriptionStatus(id, "READY");
    load();
  }
  return (
    <>
      <PageHeader
        title="Prescription Queue"
        subtitle="Prepare incoming prescriptions and notify the next workflow."
      />
      <div className="space-y-3">
        {rows
          .filter((r) => r.status === "PENDING")
          .map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-bold">{r.patient.name}</p>
                <p className="text-sm">
                  {r.medicine.name} · {r.medicine.dosage} · Qty {r.quantity}
                </p>
                <p className="text-xs text-slate-400">
                  Stock: {r.medicine.stock}
                </p>
              </div>
              <button
                onClick={() => ready(r.id)}
                className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white"
              >
                Mark Ready
              </button>
            </div>
          ))}
      </div>
    </>
  );
}
