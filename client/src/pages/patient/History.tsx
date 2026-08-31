import PageHeader from "../../components/common/PageHeader";
import { useEffect, useState } from "react";
import { clinic, unwrap } from "../../services/clinicService";
import {
  FileText,
  Activity,
  Stethoscope,
  Pill,
  Calendar,
  Building2,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react";
import Badge from "../../components/common/Badge";

function formatRupiah(value = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PatientHistory() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    clinic
      .visits()
      .then((r) => {
        const data = unwrap(r);
        setRows(data);
        if (data.length > 0) {
          setExpandedId(data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <PageHeader
        title="Riwayat Rekam Medis Pasien"
        subtitle="Daftar histori kunjungan, hasil pemeriksaan vital signs, diagnosa dokter, dan resep obat."
      />

      <div className="space-y-4">
        {rows.map((v) => {
          const isExpanded = expandedId === v.id;
          const hasVitals = v.bloodPressure || v.temperature || v.weight || v.height;
          const diagnoses = v.diagnoses || [];
          const prescriptions = v.prescriptions || [];
          const invoice = v.invoice;

          return (
            <div
              key={v.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition"
            >
              {/* HEADER KUNJUNGAN */}
              <div
                onClick={() => toggleExpand(v.id)}
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#168c9b]/10 text-[#168c9b] font-mono font-black text-sm">
                    {v.queueNumber || `A0${v.id}`}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#101a3d] text-base">{v.doctor?.name}</h3>
                      <span className="text-xs text-slate-500 font-semibold">({v.doctor?.specialization})</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400" />
                      <span>{v.poli?.name || "Poli Umum"}</span>
                      <span>·</span>
                      <Calendar size={14} className="text-slate-400" />
                      <span>{new Date(v.visitDate).toLocaleString("id-ID")}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
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
                  <button className="text-slate-400 hover:text-slate-600">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Rincian Rekam Medis (Expandable) */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-[#fbfbfa] p-5 space-y-5">
                  {/* KELUHAN PASIEN */}
                  {v.complaint && (
                    <div className="rounded-xl bg-white p-4 border border-slate-200">
                      <p className="text-xs font-bold text-[#168c9b] uppercase tracking-wider">
                        Keluhan Utama Pasien
                      </p>
                      <p className="mt-1 text-sm text-[#101a3d] italic">"{v.complaint}"</p>
                    </div>
                  )}

                  {/* VITAL SIGNS */}
                  <div>
                    <p className="text-xs font-bold text-[#168c9b] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Activity size={16} /> Pemeriksaan Vital Signs (Perawat)
                    </p>
                    {hasVitals ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="rounded-xl bg-white p-3 border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Tekanan Darah</span>
                          <p className="text-base font-bold text-[#101a3d] mt-0.5">{v.bloodPressure || "-"}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3 border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Suhu Tubuh</span>
                          <p className="text-base font-bold text-[#101a3d] mt-0.5">{v.temperature ? `${v.temperature}°C` : "-"}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3 border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Berat Badan</span>
                          <p className="text-base font-bold text-[#101a3d] mt-0.5">{v.weight ? `${v.weight} kg` : "-"}</p>
                        </div>
                        <div className="rounded-xl bg-white p-3 border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Tinggi Badan</span>
                          <p className="text-base font-bold text-[#101a3d] mt-0.5">{v.height ? `${v.height} cm` : "-"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Pemeriksaan fisik awal belum dicatat.</p>
                    )}
                  </div>

                  {/* DIAGNOSA DOKTER */}
                  <div>
                    <p className="text-xs font-bold text-[#168c9b] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Stethoscope size={16} /> Diagnosa Dokter & Catatan Medis
                    </p>
                    {diagnoses.length > 0 ? (
                      <div className="space-y-2">
                        {diagnoses.map((d: any) => (
                          <div key={d.id} className="rounded-xl bg-white p-4 border border-slate-200">
                            <h4 className="font-bold text-[#101a3d] text-sm">{d.diagnosisName}</h4>
                            {d.notes && <p className="text-xs text-slate-600 mt-1">{d.notes}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Diagnosa dokter belum diinput.</p>
                    )}
                  </div>

                  {/* RESEP OBAT */}
                  <div>
                    <p className="text-xs font-bold text-[#168c9b] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Pill size={16} /> Resep Obat & Aturan Pakai
                    </p>
                    {prescriptions.length > 0 ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {prescriptions.map((p: any) => (
                          <div key={p.id} className="rounded-xl bg-white p-3 border border-slate-200 flex items-center justify-between">
                            <div>
                              <p className="font-bold text-sm text-[#101a3d]">{p.medicine?.name}</p>
                              <p className="text-xs text-slate-500">Dosis: {p.medicine?.dosage} · Qty: {p.quantity}</p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Tidak ada resep obat pada kunjungan ini.</p>
                    )}
                  </div>

                  {/* INVOICE TAGIHAN SUMMARY */}
                  {invoice && (
                    <div className="rounded-xl bg-[#101a3d] p-4 text-white flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Receipt className="text-[#22a5b2]" size={24} />
                        <div>
                          <p className="text-xs text-slate-300">Total Tagihan Kunjungan</p>
                          <p className="text-lg font-bold text-[#e7dcae]">{formatRupiah(Number(invoice.total))}</p>
                        </div>
                      </div>
                      <Badge tone={invoice.status === "PAID" ? "emerald" : "amber"}>
                        {invoice.status === "PAID" ? "LUNAS" : "BELUM BAYAR"}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {!loading && rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <FileText className="mx-auto text-slate-400 mb-2" size={32} />
            <h3 className="font-bold text-[#101a3d]">Belum Ada Riwayat Kunjungan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Anda belum pernah mendaftar antrean klinik. Gunakan menu Registrasi Online untuk mendaftar antrean pertama Anda.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
