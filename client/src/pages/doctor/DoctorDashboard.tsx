import {
  Clock3,
  Stethoscope,
  CheckCircle2,
  Users,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import Badge from "../../components/common/Badge";
import { clinic, unwrap } from "../../services/clinicService";
export default function DoctorDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => clinic.visits().then((r) => setRows(unwrap(r)));
  useEffect(() => {
    load();
  }, []);
  return (
    <>
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Today's queue, patient information and consultation workspace."
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
          label="Consultation"
          value={rows.filter((v) => v.status === "IN_CONSULTATION").length}
          icon={Stethoscope}
          tone="cyan"
        />
        <StatCard
          label="Completed"
          value={rows.filter((v) => v.status === "COMPLETED").length}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard label="Today's Patients" value={rows.length} icon={Users} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <section className="ad-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ece8df] p-5">
            <div>
              <h2 className="ad-section-title text-lg">My Schedule</h2>
              <p className="text-xs text-[#7b8497]">
                Patients assigned to your queue
              </p>
            </div>
            <Link
              to="/dashboard/doctor/queue"
              className="text-xs font-black text-[#168c9b]"
            >
              Open queue <ArrowRight className="inline" size={14} />
            </Link>
          </div>
          <div className="divide-y divide-[#eeeae2]">
            {rows.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="font-black text-[#101a3d]">{v.patient.name}</p>
                  <p className="mt-1 text-xs text-[#7b8497]">
                    {new Date(v.visitDate).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {v.patient.age} years · {v.patient.gender}
                  </p>
                </div>
                <Badge
                  tone={
                    v.status === "WAITING"
                      ? "amber"
                      : v.status === "IN_CONSULTATION"
                        ? "cyan"
                        : "emerald"
                  }
                >
                  {v.status.replaceAll("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </section>
        <section className="ad-card p-6">
          <div className="rounded-2xl bg-[#101a3d] p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#56c6d0]">
              Clinical workspace
            </p>
            <h2 className="mt-2 text-2xl font-black">Consultation ready</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Review medical history, record diagnosis and send prescriptions
              from one flow.
            </p>
            <Link
              to="/dashboard/doctor/consultation"
              className="ad-btn ad-btn-primary mt-5"
            >
              Open consultation
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
