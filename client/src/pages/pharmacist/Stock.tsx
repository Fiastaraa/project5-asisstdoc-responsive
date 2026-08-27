import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import WorkspaceCard from "../../components/common/WorkspaceCard";
import { clinic, unwrap } from "../../services/clinicService";
export default function Stock() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    clinic.medicines().then((r) => setRows(unwrap(r)));
  }, []);
  return (
    <>
      <PageHeader
        title="Stock Management"
        subtitle="Monitor stock level before preparing prescriptions."
      />
      <WorkspaceCard
        title="Adjust & Monitor Stock"
        subtitle="Medicine inventory overview"
      >
        <div className="space-y-3">
          {rows.map((m) => (
            <div
              key={m.id}
              className="grid items-center gap-3 rounded-xl border p-4 sm:grid-cols-[1.5fr_.7fr_.7fr_auto]"
            >
              <div>
                <b>{m.name}</b>
                <p className="text-xs text-[#7b8497]">{m.dosage}</p>
              </div>
              <span className="text-sm">
                Rp {Number(m.price).toLocaleString("id-ID")}
              </span>
              <span
                className={`font-black ${m.stock < 20 ? "text-[#a13e34]" : "text-[#21704b]"}`}
              >
                {m.stock} units
              </span>
              <button className="ad-btn ad-btn-primary py-2">Update</button>
            </div>
          ))}
        </div>
      </WorkspaceCard>
    </>
  );
}
