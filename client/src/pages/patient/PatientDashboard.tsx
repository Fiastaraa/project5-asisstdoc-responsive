import {
  Clock3,
  FileText,
  Receipt,
  CalendarDays,
  RefreshCw,
  UserPlus,
  BellRing,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import { clinic, unwrap } from "../../services/clinicService";
import Badge from "../../components/common/Badge";

export default function PatientDashboard() {
  const [rows, setRows] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any>(null);

  const load = () =>
    clinic.visits().then((r) => {
      const data = unwrap(r);
      setRows(data);
      const active = data.find((v: any) => v.status === "WAITING" || v.status === "CALLED" || v.status === "IN_CONSULTATION");
      setActiveTicket(active || null);
    });

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <PageHeader
        title="Patient Dashboard"
        subtitle="Kelola registrasi online, tiket antrean digital, dan riwayat kunjungan."
        action={
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/patient/registration"
              className="inline-flex items-center gap-2 rounded-xl bg-[#168c9b] px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-[#12727f] transition"
            >
              <UserPlus size={16} />
              Daftar Antrean Online
            </Link>
            <button
              onClick={load}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Antrean Aktif"
          value={rows.filter((v) => v.status === "WAITING" || v.status === "CALLED").length}
          icon={Clock3}
          tone="amber"
        />
        <StatCard label="Total Kunjungan" value={rows.length} icon={CalendarDays} />
        <StatCard
          label="Rekam Medis"
          value={rows.filter((v) => v.diagnoses?.length).length}
          icon={FileText}
          tone="cyan"
        />
        <StatCard
          label="Invoice Tagihan"
          value={rows.filter((v) => v.invoice).length}
          icon={Receipt}
          tone="violet"
        />
      </div>

      {/* TIKET ANTREAN DENGAN NOTIFIKASI PANGGILAN */}
      {activeTicket && (
        <div className={`mt-6 rounded-2xl p-6 text-white shadow-xl transition relative overflow-hidden ${activeTicket.status === "CALLED" ? "bg-gradient-to-r from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-400 animate-pulse" : "bg-[#101a3d] border border-white/10"}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#22a5b2]">
                  Tiket Antrean Aktif Hari Ini
                </span>
                {activeTicket.status === "CALLED" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs font-black text-amber-900">
                    <BellRing size={12} className="animate-bounce" /> DIPANGGIL!
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold mt-1">
                {activeTicket.poli?.name || "Poli Umum"} · {activeTicket.doctor?.name}
              </h2>
            </div>
            <Badge tone={activeTicket.status === "CALLED" ? "amber" : activeTicket.status === "IN_CONSULTATION" ? "cyan" : "violet"}>
              {activeTicket.status}
            </Badge>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3 items-center">
            <div className="text-center md:text-left bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-300">Nomor Antrean Anda</p>
              <p className="text-4xl font-black text-[#e7dcae] tracking-wider mt-1">
                {activeTicket.queueNumber || `A0${activeTicket.id}`}
              </p>
            </div>

            <div className="text-center md:text-left bg-white/5 p-4 rounded-xl">
              <p className="text-xs text-slate-300">Estimasi Waktu Tunggu</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1 flex items-center justify-center md:justify-start gap-2">
                <Clock3 size={20} />
                ~{activeTicket.estimatedWaitMinutes || 15} Menit Lagi
              </p>
            </div>

            <div className="text-center md:text-right">
              <Link
                to="/dashboard/patient/queue"
                className="inline-block rounded-xl bg-[#168c9b] px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#12727f]"
              >
                Lihat Detail Antrean Digital &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_.75fr]">
        <section className="ad-card p-6">
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#168c9b]">
            Digital Outpatient Journey
          </p>
          <h2 className="mt-2 text-2xl font-black text-[#101a3d]">
            Alur Layanan Rawat Jalan Anda
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#7b8497]">
            Registrasi Online Poli $\rightarrow$ Antrean Digital $\rightarrow$ Pemeriksaan Awal $\rightarrow$ Pemeriksaan Dokter $\rightarrow$ Resep & Pembayaran.
          </p>

          <div className="mt-7 grid grid-cols-5 gap-2">
            {[
              { title: "Registrasi", desc: "Pilih Poli" },
              { title: "Antrean", desc: "Menunggu" },
              { title: "Dipanggil", desc: "Pemeriksaan Awal" },
              { title: "Dokter", desc: "Konsultasi" },
              { title: "Selesai", desc: "Obat & Bayar" },
            ].map((x, i) => (
              <div key={x.title} className="text-center">
                <div
                  className={`mx-auto grid h-10 w-10 place-items-center rounded-full font-black text-sm ${i < 2 ? "bg-[#168c9b] text-white shadow-md" : "bg-[#e8e4d8] text-[#7b8497]"}`}
                >
                  {i + 1}
                </div>
                <p className="mt-2 text-xs font-bold text-[#101a3d]">{x.title}</p>
                <p className="text-[10px] text-[#7b8497]">{x.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="ad-card p-6">
          <h2 className="ad-section-title">Riwayat Kunjungan Terakhir</h2>
          <div className="mt-4 space-y-3">
            {rows.slice(0, 4).map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#168c9b]">
                      {v.queueNumber || `A0${v.id}`}
                    </span>
                    <p className="font-black text-sm">{v.doctor.name}</p>
                  </div>
                  <p className="text-xs text-[#7b8497] mt-0.5">
                    {v.poli?.name || "Poli Umum"} · {new Date(v.visitDate).toLocaleString("id-ID")}
                  </p>
                </div>
                <Badge
                  tone={
                    v.status === "PAID"
                      ? "emerald"
                      : v.status === "WAITING"
                        ? "amber"
                        : v.status === "CALLED"
                          ? "cyan"
                          : "violet"
                  }
                >
                  {v.status.replaceAll("_", " ")}
                </Badge>
              </div>
            ))}

            {rows.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-400">Belum ada data kunjungan.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
