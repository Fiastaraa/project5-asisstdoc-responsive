import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import { clinic, unwrap } from "../../services/clinicService";

export default function QueuePage({ role }: { role: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try {
      setRows(unwrap(await clinic.visits()));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const groups = ["WAITING", "IN_CONSULTATION", "COMPLETED"];
  return (
    <>
      <PageHeader
        title="Patient Queue"
        subtitle="Live queue shared across registration, nurse and doctor workflow."
        action={
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        {groups.map((g) => (
          <div
            key={g}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 p-4">
              <p className="font-bold">{g.replaceAll("_", " ")}</p>
              <p className="text-xs text-slate-400">
                {rows.filter((v) => v.status === g).length} patients
              </p>
            </div>
            <div className="space-y-3 p-4">
              {rows
                .filter((v) => v.status === g)
                .map((v) => (
                  <div
                    key={v.id}
                    className="rounded-xl border border-slate-100 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{v.patient.name}</p>
                        <p className="text-xs text-slate-500">
                          {v.doctor.name} ·{" "}
                          {new Date(v.visitDate).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge
                        tone={
                          g === "WAITING"
                            ? "amber"
                            : g === "IN_CONSULTATION"
                              ? "cyan"
                              : "emerald"
                        }
                      >
                        {g.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      {role === "NURSE" && g === "WAITING" && (
                        <Link
                          to={`/dashboard/nurse/vitals?visitId=${v.id}`}
                          className="block rounded-lg bg-cyan-600 px-3 py-2 text-center text-xs font-bold text-white"
                        >
                          Open Initial Assessment
                        </Link>
                      )}
                      {role === "DOCTOR" && g === "IN_CONSULTATION" && (
                        <Link
                          to={`/dashboard/doctor/consultation?visitId=${v.id}`}
                          className="block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs font-bold text-white"
                        >
                          Open Consultation
                        </Link>
                      )}
                      {role !== "NURSE" &&
                        role !== "DOCTOR" &&
                        g !== "COMPLETED" && (
                          <p className="text-xs text-slate-400">
                            Workflow controlled by the assigned clinical role.
                          </p>
                        )}
                    </div>
                  </div>
                ))}
              {!loading && rows.filter((v) => v.status === g).length === 0 && (
                <p className="py-6 text-center text-sm text-slate-400">
                  No patients
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
