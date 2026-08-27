import PageHeader from "../../components/common/PageHeader";
import { useEffect, useState } from "react";
import { clinic, unwrap } from "../../services/clinicService";
export default function Invoices() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    clinic.visits().then((r) => setRows(unwrap(r)));
  }, []);
  return (
    <>
      <PageHeader title="My Invoices" subtitle="Patient self-service view." />
      <div className="space-y-3">
        {rows.map((v) => (
          <div key={v.id} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold">
                  Visit #{v.id} · {v.doctor.name}
                </p>
                <p className="text-sm text-slate-500">
                  {new Date(v.visitDate).toLocaleString("id-ID")}
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                {v.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
