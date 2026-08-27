import {
  ClipboardList,
  HeartPulse,
  Clock3,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { clinic, unwrap } from "../../services/clinicService";
import Badge from "../../components/common/Badge";
export default function NurseDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => clinic.visits().then((r) => setRows(unwrap(r)));
  useEffect(() => {
    load();
  }, []);
  return (
    <>
      <PageHeader
        title="Nurse Dashboard"
        subtitle="Patient queue, initial assessment and vital signs."
        action={
          <button
            onClick={load}
            className="ad-btn border border-[#dfe3ea] bg-white"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Waiting"
          value={rows.filter((v) => v.status === "WAITING").length}
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Vitals Needed"
          value={
            rows.filter((v) => v.status === "WAITING" && !v.temperature).length
          }
          icon={HeartPulse}
          tone="rose"
        />
        <StatCard
          label="In Consultation"
          value={rows.filter((v) => v.status === "IN_CONSULTATION").length}
          icon={ClipboardList}
          tone="cyan"
        />
        <StatCard
          label="Completed"
          value={rows.filter((v) => v.status === "COMPLETED").length}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="ad-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ece8df] p-5">
            <div>
              <h2 className="ad-section-title text-lg">Patient Queue</h2>
              <p className="text-xs text-[#7b8497]">
                Patients requiring initial assessment
              </p>
            </div>
            <Link
              to="/dashboard/nurse/queue"
              className="text-xs font-black text-[#168c9b]"
            >
              View queue <ArrowRight className="inline" size={14} />
            </Link>
          </div>
          <div className="divide-y divide-[#eeeae2]">
            {rows.slice(0, 6).map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-3 p-5"
              >
                <div>
                  <p className="font-black text-[#101a3d]">{v.patient.name}</p>
                  <p className="text-xs text-[#7b8497]">
                    {v.patient.phone} · {v.doctor.name}
                  </p>
                </div>
                <Badge tone={v.temperature ? "cyan" : "amber"}>
                  {v.temperature ? "Vitals recorded" : "Needs vitals"}
                </Badge>
              </div>
            ))}
          </div>
        </section>
        <section className="ad-card p-6">
          <h2 className="ad-section-title text-lg">My Tasks</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border p-4">
              <b>✓ Prepare room</b>
              <p className="mt-1 text-xs text-[#7b8497]">
                Before the first queue
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <b>✓ Stock supplies</b>
              <p className="mt-1 text-xs text-[#7b8497]">
                Check basic examination tools
              </p>
            </div>
            <div className="rounded-xl border border-[#e8d89c] bg-[#fff9df] p-4">
              <b>○ Vitals check</b>
              <p className="mt-1 text-xs text-[#7b8497]">
                Prioritize waiting patients
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
