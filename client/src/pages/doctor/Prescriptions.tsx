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
    (v.prescriptions || []).map((p: any) => ({
      ...p,
      patient: v.patient,
      doctor: v.doctor,
    })),
  );
  return (
    <>
      <PageHeader
        title="Prescription History"
        subtitle="Review medicine, dosage and quantity sent from consultation."
      />
      <WorkspaceCard
        title="Prescription List"
        subtitle="Doctor prescription records"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f5ef] text-[10px] uppercase tracking-wider text-[#7b8497]">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rx.map((r: any) => (
                <tr key={r.id} className="border-t border-[#eeeae2]">
                  <td className="px-4 py-4 font-black">{r.patient?.name}</td>
                  <td>{r.medicine?.name}</td>
                  <td>{r.medicine?.dosage}</td>
                  <td>{r.quantity}</td>
                  <td>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${r.status === "READY" ? "bg-[#e5f6ed] text-[#21704b]" : "bg-[#fff5d8] text-[#806a1b]"}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </WorkspaceCard>
    </>
  );
}
