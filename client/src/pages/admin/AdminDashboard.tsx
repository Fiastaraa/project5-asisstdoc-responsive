import {
  Activity,
  Clock3,
  Receipt,
  Users,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import Badge from "../../components/common/Badge";
import { getAdminDashboard } from "../../services/adminService";

const money = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
export default function AdminDashboard() {
  const [d, setD] = useState<any>({
    todayVisits: 0,
    waiting: 0,
    inConsultation: 0,
    completed: 0,
    paid: 0,
    unpaidInvoices: 0,
    todayRevenue: 0,
    queue: [],
  });
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setD((await getAdminDashboard()).data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Today's overview, queue and payment operations."
        action={
          <button
            onClick={load}
            className="ad-btn border border-[#dfe3ea] bg-white text-[#101a3d]"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Patients Today" value={d.todayVisits} icon={Users} />
        <StatCard
          label="In Queue"
          value={d.waiting}
          icon={Clock3}
          tone="amber"
        />
        <StatCard
          label="In Consultation"
          value={d.inConsultation}
          icon={Activity}
          tone="cyan"
        />
        <StatCard
          label="Completed"
          value={d.completed}
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard label="Paid" value={d.paid} icon={Receipt} tone="violet" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_.9fr]">
        <section className="ad-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ece8df] p-5">
            <div>
              <h2 className="ad-section-title text-lg">Today's Queue</h2>
              <p className="text-xs text-[#7b8497]">
                Patient status across the outpatient flow
              </p>
            </div>
            <Link
              to="/dashboard/admin/queue"
              className="text-xs font-black text-[#168c9b]"
            >
              View full queue <ArrowRight className="inline" size={14} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f5ef] text-[10px] uppercase tracking-wider text-[#7b8497]">
                <tr>
                  <th className="px-5 py-3">Patient</th>
                  <th>Time</th>
                  <th>Doctor</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(d.queue || []).map((v: any) => (
                  <tr key={v.id} className="border-t border-[#eeeae2]">
                    <td className="px-5 py-4 font-black text-[#101a3d]">
                      {v.patient?.name}
                    </td>
                    <td>
                      {new Date(v.visitDate).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>{v.doctor?.name}</td>
                    <td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="space-y-5">
          <div className="ad-card bg-[#101a3d] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#168c9b]">
                <WalletCards size={19} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">
                  Revenue Summary
                </p>
                <h2 className="text-lg font-black">Today's Revenue</h2>
              </div>
            </div>
            <p className="mt-7 text-3xl font-black">{money(d.todayRevenue)}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/8 p-3">
                <p className="text-[10px] text-slate-400">Unpaid invoices</p>
                <b className="text-xl">{d.unpaidInvoices}</b>
              </div>
              <div className="rounded-xl bg-white/8 p-3">
                <p className="text-[10px] text-slate-400">Completed visits</p>
                <b className="text-xl">{d.completed}</b>
              </div>
            </div>
          </div>
          <div className="ad-card p-5">
            <h3 className="ad-section-title">Daily Visits</h3>
            <div className="mt-5 flex h-32 items-end gap-2">
              {[35, 52, 44, 62, 58, 78, 68, 84, 72, 92].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-[#168c9b]/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-[#8b92a2]">
              <span>08</span>
              <span>10</span>
              <span>12</span>
              <span>14</span>
              <span>16</span>
              <span>18</span>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
