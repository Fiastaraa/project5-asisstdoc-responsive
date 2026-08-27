import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import WorkspaceCard from "../../components/common/WorkspaceCard";
import { clinic, unwrap } from "../../services/clinicService";
export default function Prescriptions() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    clinic.visits().then((r) => setRows(unwrap(r)));
  }, []);
  const rx = rows.flatMap((v) =>
    (v.prescriptions || []).map((p: any) => ({ ...p, patient: v.patient })),
  );
  return (
    <>
      <PageHeader
        title="Prescription Detail"
        subtitle="Patient, medicine, dosage and quantity."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <WorkspaceCard
          title="Selected Prescription"
          subtitle="Pharmacy preparation details"
        >
          <div className="space-y-4">
            {rx.slice(0, 1).map((r: any) => (
              <div key={r.id}>
                <p className="text-xs font-black uppercase tracking-wider text-[#7b8497]">
                  Patient
                </p>
                <p className="text-2xl font-black text-[#101a3d]">
                  {r.patient?.name}
                </p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-xl bg-[#f7f5ef] p-4">
                    <b>Medicine</b>
                    <p>{r.medicine?.name}</p>
                  </div>
                  <div className="rounded-xl bg-[#f7f5ef] p-4">
                    <b>Dosage</b>
                    <p>{r.medicine?.dosage}</p>
                  </div>
                  <div className="rounded-xl bg-[#f7f5ef] p-4">
                    <b>Quantity</b>
                    <p>{r.quantity} tablets</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WorkspaceCard>
        <WorkspaceCard
          title="All Prescriptions"
          subtitle="Incoming and prepared medicines"
        >
          <div className="space-y-3">
            {rx.map((r: any) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div>
                  <b>{r.patient?.name}</b>
                  <p className="text-xs text-[#7b8497]">
                    {r.medicine?.name} · Qty {r.quantity}
                  </p>
                </div>
                <span className="rounded-full bg-[#e5f6ed] px-3 py-1 text-xs font-black text-[#21704b]">
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </WorkspaceCard>
      </div>
    </>
  );
}
