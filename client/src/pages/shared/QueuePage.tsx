import { useEffect, useState } from "react";
import { RefreshCw, Bell, Stethoscope, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Badge from "../../components/common/Badge";
import { clinic, unwrap } from "../../services/clinicService";

export default function QueuePage({ role }: { role: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

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

  async function changeStatus(visitId: number, status: string) {
    try {
      await clinic.status(visitId, status);
      setMsg(`Status antrean berhasil diperbarui menjadi ${status}.`);
      load();
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Gagal memperbarui status antrean.");
    }
  }

  const groups = [
    { key: "WAITING", title: "MENUNGGU", tone: "amber" as const },
    { key: "CALLED", title: "DIPANGGIL", tone: "amber" as const },
    { key: "IN_CONSULTATION", title: "SEDANG DIPERIKSA", tone: "cyan" as const },
    { key: "COMPLETED", title: "SELESAI", tone: "emerald" as const },
  ];

  return (
    <>
      <PageHeader
        title="Antrean Digital Klinik"
        subtitle="Pemantauan antrean real-time untuk Admin, Perawat, Dokter & Apoteker."
        action={
          <button
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        }
      />

      {msg && (
        <div className="mb-4 rounded-xl bg-cyan-50 border border-cyan-200 p-3 text-sm font-semibold text-cyan-900">
          {msg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {groups.map((g) => (
          <div
            key={g.key}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col"
          >
            <div className="border-b border-slate-100 p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-[#101a3d] text-sm">{g.title}</p>
                <p className="text-xs text-slate-400">
                  {rows.filter((v) => v.status === g.key).length} pasien
                </p>
              </div>
              <Badge tone={g.tone}>{g.title}</Badge>
            </div>

            <div className="space-y-3 p-4 flex-1">
              {rows
                .filter((v) => v.status === g.key)
                .map((v) => (
                  <div
                    key={v.id}
                    className="rounded-xl border border-slate-200 p-3.5 hover:border-[#168c9b] transition bg-white"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <span className="font-mono text-sm font-black text-[#168c9b]">
                        {v.queueNumber || `A0${v.id}`}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-slate-100 px-2 py-0.5 text-slate-600">
                        {v.poli?.code || "UMU"}
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="font-bold text-[#101a3d] text-sm">{v.patient?.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {v.doctor?.name} · {v.poli?.name || "Poli Umum"}
                      </p>
                      {v.complaint && (
                        <p className="text-xs italic text-slate-500 mt-1 line-clamp-1">
                          "{v.complaint}"
                        </p>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100">
                      {/* ACTION BUTTONS PER ROLE */}
                      {(role === "NURSE" || role === "ADMIN") && g.key === "WAITING" && (
                        <button
                          onClick={() => changeStatus(v.id, "CALLED")}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow"
                        >
                          <Bell size={14} /> Panggil Pasien
                        </button>
                      )}

                      {role === "NURSE" && (g.key === "WAITING" || g.key === "CALLED") && (
                        <Link
                          to={`/dashboard/nurse/vitals?visitId=${v.id}`}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#168c9b] px-3 py-2 text-xs font-bold text-white hover:bg-[#12727f]"
                        >
                          <ClipboardList size={14} /> Pemeriksaan Vital Signs
                        </Link>
                      )}

                      {role === "DOCTOR" && (g.key === "WAITING" || g.key === "CALLED") && (
                        <button
                          onClick={() => changeStatus(v.id, "IN_CONSULTATION")}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-bold text-white hover:bg-cyan-700 shadow"
                        >
                          <Stethoscope size={14} /> Mulai Konsultasi
                        </button>
                      )}

                      {role === "DOCTOR" && g.key === "IN_CONSULTATION" && (
                        <Link
                          to={`/dashboard/doctor/consultation?visitId=${v.id}`}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow"
                        >
                          <Stethoscope size={14} /> Buka Ruang Diagnosa
                        </Link>
                      )}
                    </div>
                  </div>
                ))}

              {!loading && rows.filter((v) => v.status === g.key).length === 0 && (
                <p className="py-8 text-center text-xs text-slate-400">
                  Tidak ada pasien
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
