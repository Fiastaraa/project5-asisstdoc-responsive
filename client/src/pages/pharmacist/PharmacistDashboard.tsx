import {
  Pill,
  PackageCheck,
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
export default function PharmacistDashboard() {
  const [visits, setVisits] = useState<any[]>([]);
  const load = () => clinic.visits().then((r) => setVisits(unwrap(r)));
  useEffect(() => {
    load();
  }, []);
  const rx = visits.flatMap((v) => v.prescriptions || []);
  return (
    <>
      <PageHeader
        title="Pharmacist Dashboard"
        subtitle="Prescription queue, medicine inventory and preparation."
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
          label="Waiting Rx"
          value={rx.filter((r) => r.status === "PENDING").length}
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="Prepared"
          value={rx.filter((r) => r.status === "READY").length}
          icon={PackageCheck}
          tone="emerald"
        />
        <StatCard
          label="Prescriptions"
          value={rx.length}
          icon={Pill}
          tone="cyan"
        />
        <StatCard label="Visits" value={visits.length} icon={CheckCircle2} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <section className="ad-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ece8df] p-5">
            <div>
              <h2 className="ad-section-title text-lg">
                Today's Prescriptions
              </h2>
              <p className="text-xs text-[#7b8497]">
                Prepare medicines and update status
              </p>
            </div>
            <Link
              to="/dashboard/pharmacist/queue"
              className="text-xs font-black text-[#168c9b]"
            >
              Open queue <ArrowRight className="inline" size={14} />
            </Link>
          </div>
          <div className="divide-y divide-[#eeeae2]">
            {rx.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-3 p-5"
              >
                <div>
                  <p className="font-black text-[#101a3d]">{r.medicine.name}</p>
                  <p className="text-xs text-[#7b8497]">
                    Qty {r.quantity} · Visit #{r.visit?.id}
                  </p>
                </div>
                <Badge tone={r.status === "READY" ? "emerald" : "amber"}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>
        <section className="ad-card p-6">
          <div className="rounded-2xl bg-[#101a3d] p-6 text-white">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#56c6d0]">
              Inventory
            </p>
            <h2 className="mt-2 text-2xl font-black">Stock readiness</h2>
            <p className="mt-2 text-sm text-slate-300">
              Open Medicine Inventory to review dosage, stock and price before
              preparing prescriptions.
            </p>
            <Link
              to="/dashboard/pharmacist/inventory"
              className="ad-btn ad-btn-primary mt-5"
            >
              View inventory
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
