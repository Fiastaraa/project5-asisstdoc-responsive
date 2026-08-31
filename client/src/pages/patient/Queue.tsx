import PageHeader from "../../components/common/PageHeader";
import { useEffect, useState } from "react";
import { clinic, unwrap } from "../../services/clinicService";
import { Clock, RefreshCw, UserPlus, BellRing, Building2, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import Badge from "../../components/common/Badge";

export default function PatientQueue() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await clinic.visits();
      setRows(unwrap(r));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const activeVisits = rows.filter((v) => v.status === "WAITING" || v.status === "CALLED" || v.status === "IN_CONSULTATION");
  const pastVisits = rows.filter((v) => v.status === "COMPLETED" || v.status === "PAID");

  return (
    <>
      <PageHeader
        title="Antrean Digital Saya"
        subtitle="Pantau status antrean real-time, nomor panggilan, dan estimasi waktu tunggu."
        action={
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/patient/registration"
              className="inline-flex items-center gap-2 rounded-xl bg-[#168c9b] px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-[#12727f] transition"
            >
              <UserPlus size={16} />
              Daftar Poli
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

      {/* ANTREAN AKTIF BANNER NOTIFIKASI */}
      {activeVisits.some((v) => v.status === "CALLED") && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-700 p-5 text-white shadow-lg animate-pulse flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/20 text-white">
              <BellRing size={24} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-lg font-black">GILIRAN ANTREAN ANDA DIPANGGIL!</h3>
              <p className="text-xs text-amber-100">
                Silakan menuju ke Poli Periksa sekarang untuk pemeriksaan awal oleh Perawat/Dokter.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#101a3d] mb-3 flex items-center gap-2">
            <Clock className="text-[#168c9b]" size={20} />
            Antrean Hari Ini (Aktif)
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {activeVisits.map((v) => (
              <div
                key={v.id}
                className={`rounded-2xl border p-5 shadow-sm transition ${
                  v.status === "CALLED"
                    ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-300"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#168c9b]">
                      {v.poli?.name || "Poli Klinik"}
                    </span>
                    <h3 className="text-3xl font-black text-[#101a3d] mt-1 font-mono">
                      {v.queueNumber || `A0${v.id}`}
                    </h3>
                  </div>
                  <Badge
                    tone={
                      v.status === "CALLED"
                        ? "amber"
                        : v.status === "IN_CONSULTATION"
                          ? "cyan"
                          : "violet"
                    }
                  >
                    {v.status === "CALLED" ? "DIPANGGIL" : v.status.replaceAll("_", " ")}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Stethoscope size={16} className="text-slate-400" />
                    <span className="font-bold">{v.doctor?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-xs">
                    <Building2 size={16} className="text-slate-400" />
                    <span>{v.poli?.name || "Poli Umum"} ({v.poli?.code || "UMU"})</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                    <Clock size={16} className="text-emerald-500" />
                    <span>Estimasi Tunggu: ~{v.estimatedWaitMinutes || 15} Menit</span>
                  </div>
                </div>
              </div>
            ))}

            {!loading && activeVisits.length === 0 && (
              <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <p className="font-bold text-[#101a3d]">Belum Ada Antrean Aktif Hari Ini</p>
                <p className="mt-1 text-xs text-slate-500">
                  Anda tidak sedang berada dalam antrean. Silakan klik tombol "Daftar Poli" di atas untuk mendaftar antrean online.
                </p>
              </div>
            )}
          </div>
        </div>

        {pastVisits.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-[#101a3d] mb-3">Kunjungan Selesai</h2>
            <div className="space-y-3">
              {pastVisits.map((v) => (
                <div key={v.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#168c9b]">{v.queueNumber || `A0${v.id}`}</span>
                      <p className="font-bold text-[#101a3d]">{v.doctor?.name}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {v.poli?.name || "Poli Umum"} · {new Date(v.visitDate).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <Badge tone={v.status === "PAID" ? "emerald" : "violet"}>
                    {v.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
