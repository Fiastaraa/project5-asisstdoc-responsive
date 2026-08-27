import {
  Clock3,
  FileText,
  Receipt,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { clinic, unwrap } from "../../services/clinicService";
import Badge from "../../components/common/Badge";
export default function PatientDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const load = () => clinic.visits().then((r) => setRows(unwrap(r)));
  useEffect(() => {
    load();
  }, []);
  return (
    <>
      <PageHeader
        title="Patient Dashboard"
        subtitle="Track your queue, visit history and payment status."
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
        <StatCard label="Visits" value={rows.length} icon={CalendarDays} />
        <StatCard
          label="Medical Records"
          value={rows.filter((v) => v.diagnoses?.length).length}
          icon={FileText}
          tone="cyan"
        />
        <StatCard
          label="Invoices"
          value={rows.filter((v) => v.invoice).length}
          icon={Receipt}
          tone="violet"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_.75fr]">
        <section className="ad-card p-6">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#168c9b]">
            Digital queue
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#101a3d]">
            Your outpatient journey
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#7b8497]">
            Registration → queue → nurse assessment → doctor consultation →
            pharmacy → payment.
          </p>
          <div className="mt-7 grid grid-cols-5 gap-2">
            {["Registration", "Queue", "Nurse", "Doctor", "Paid"].map(
              (x, i) => (
                <div key={x} className="text-center">
                  <div
                    className={`mx-auto grid h-9 w-9 place-items-center rounded-full font-black ${i < 2 ? "bg-[#168c9b] text-white" : "bg-[#e8e4d8] text-[#7b8497]"}`}
                  >
                    {i + 1}
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-[#7b8497]">
                    {x}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
        <section className="ad-card p-6">
          <h2 className="ad-section-title">Latest Visits</h2>
          <div className="mt-4 space-y-3">
            {rows.slice(0, 4).map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <div>
                  <p className="font-black">{v.doctor.name}</p>
                  <p className="text-xs text-[#7b8497]">
                    {new Date(v.visitDate).toLocaleString("id-ID")}
                  </p>
                </div>
                <Badge
                  tone={
                    v.status === "PAID"
                      ? "emerald"
                      : v.status === "WAITING"
                        ? "amber"
                        : "cyan"
                  }
                >
                  {v.status.replaceAll("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
