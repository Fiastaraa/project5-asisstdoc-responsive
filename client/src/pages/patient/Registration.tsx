import { useEffect, useState, type FormEvent } from "react";
import PageHeader from "../../components/common/PageHeader";
import { clinic, unwrap } from "../../services/clinicService";
import { CheckCircle2, Clock, User, Stethoscope, Building2, IdCard, Calendar } from "lucide-react";
import Badge from "../../components/common/Badge";

const DEFAULT_POLIS = [
  { id: 1, name: "Poli Umum", code: "UMU" },
  { id: 2, name: "Poli Obgyn", code: "OBG" },
  { id: 3, name: "Poli Anak", code: "ANK" },
  { id: 4, name: "Poli Gigi", code: "GIG" },
];

const DEFAULT_DOCTORS = [
  { id: 1, name: "Dr. Andi", specialization: "General Practitioner", poliId: 1 },
  { id: 2, name: "Dr. Budi", specialization: "Obstetrics & Gynecology", poliId: 2 },
  { id: 3, name: "Dr. Sarah", specialization: "Pediatrics", poliId: 3 },
];

export default function PatientRegistration() {
  const [polis, setPolis] = useState<any[]>(DEFAULT_POLIS);
  const [doctors, setDoctors] = useState<any[]>(DEFAULT_DOCTORS);
  const [selectedPoliId, setSelectedPoliId] = useState<string>("1");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("1");

  const [form, setForm] = useState({
    name: "",
    nik: "",
    birthDate: "",
    gender: "Female",
    age: "25",
    phone: "",
    address: "",
    complaint: "",
  });

  const [ticket, setTicket] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      clinic.polis().catch(() => ({ data: DEFAULT_POLIS })),
      clinic.doctors().catch(() => ({ data: DEFAULT_DOCTORS })),
      clinic.patients().catch(() => ({ data: [] })),
    ]).then(([p, d, patRes]) => {
      const pList = unwrap(p);
      const dList = unwrap(d);

      const finalPolis = Array.isArray(pList) && pList.length > 0 ? pList : DEFAULT_POLIS;
      const finalDocs = Array.isArray(dList) && dList.length > 0 ? dList : DEFAULT_DOCTORS;

      setPolis(finalPolis);
      setDoctors(finalDocs);

      if (finalPolis.length > 0) {
        setSelectedPoliId(String(finalPolis[0].id));
      }

      // Try pre-filling patient profile if available
      const pData = unwrap(patRes);
      if (Array.isArray(pData) && pData.length > 0) {
        const myP = pData[0];
        setForm((prev) => ({
          ...prev,
          name: myP.name || "",
          nik: myP.nik || "",
          birthDate: myP.birthDate ? new Date(myP.birthDate).toISOString().split("T")[0] : "",
          gender: myP.gender || "Female",
          age: String(myP.age || 25),
          phone: myP.phone || "",
          address: myP.address || "",
        }));
      }
    });
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    if (!selectedPoliId) return true;
    return doc.poliId === Number(selectedPoliId) || !doc.poliId;
  });

  useEffect(() => {
    if (filteredDoctors.length > 0) {
      setSelectedDoctorId(String(filteredDoctors[0].id));
    } else {
      setSelectedDoctorId("");
    }
  }, [selectedPoliId, doctors]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      // 1. Create/Update patient record
      let patientId: number;
      const existingPatients = unwrap(await clinic.patients(form.phone));
      const found = existingPatients.find((p: any) => p.phone === form.phone || (form.nik && p.nik === form.nik));

      if (found) {
        patientId = found.id;
      } else {
        const newP = unwrap(
          await clinic.createPatient({
            name: form.name,
            nik: form.nik || undefined,
            birthDate: form.birthDate || undefined,
            gender: form.gender,
            age: Number(form.age),
            phone: form.phone,
            address: form.address,
          })
        );
        patientId = newP.id;
      }

      // 2. Create visit check-in
      const visitRes = unwrap(
        await clinic.createVisit({
          patientId,
          doctorId: Number(selectedDoctorId),
          poliId: Number(selectedPoliId),
          complaint: form.complaint,
        })
      );

      setTicket(visitRes);
      setMsg("Registrasi Berhasil! Tiket antrean digital Anda telah diterbitkan.");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Registrasi gagal, silakan periksa input data Anda.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Registrasi Online Pasien"
        subtitle="Pendaftaran rawat jalan & pemilihan Poli mandiri."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#101a3d] mb-4 flex items-center gap-2">
            <User className="text-[#168c9b]" size={20} />
            Data Diri & Identitas Pasien
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Nama Lengkap *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Contoh: Budi Santoso"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">NIK (16 Digit KTP) *</label>
              <div className="relative mt-1">
                <IdCard className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  required
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))}
                  placeholder="3171012304950001"
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Tanggal Lahir *</label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="date"
                  required
                  value={form.birthDate}
                  onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Jenis Kelamin & Umur *</label>
              <div className="mt-1 flex gap-2">
                <select
                  value={form.gender}
                  onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                  className="w-1/2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="Male">Laki-laki</option>
                  <option value="Female">Perempuan</option>
                </select>
                <input
                  type="number"
                  required
                  min={0}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                  placeholder="Umur"
                  className="w-1/2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Nomor HP / WhatsApp *</label>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="081200000001"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Alamat Tinggal *</label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                placeholder="Jl. Merdeka No. 123"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="my-6 h-px bg-slate-100" />

          <h2 className="text-lg font-bold text-[#101a3d] mb-4 flex items-center gap-2">
            <Building2 className="text-[#168c9b]" size={20} />
            Pilihan Layanan Klinik (Poli & Dokter)
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Pilih Poli *</label>
              <select
                value={selectedPoliId}
                onChange={(e) => setSelectedPoliId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
              >
                {polis.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600">Pilih Dokter *</label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
              >
                {filteredDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
                {filteredDoctors.length === 0 && <option value="">Tidak ada dokter tersedia</option>}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-600">Keluhan Utama / Alasan Kunjungan *</label>
            <textarea
              required
              rows={3}
              value={form.complaint}
              onChange={(e) => setForm((f) => ({ ...f, complaint: e.target.value }))}
              placeholder="Contoh: Demam dan batuk sejak 2 hari yang lalu..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          {msg && (
            <div className={`mt-4 rounded-xl p-3 text-sm flex items-center gap-2 ${ticket ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
              {ticket && <CheckCircle2 size={18} />}
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#168c9b] py-3 text-sm font-bold text-white shadow-lg hover:bg-[#12727f] transition disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Kirim Registrasi Online & Ambil Antrean"}
          </button>
        </form>

        {/* TIKET ANTREAN DIGITAL RESULT */}
        <div>
          {ticket ? (
            <div className="rounded-2xl border-2 border-[#168c9b] bg-[#101a3d] p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#168c9b]/20 blur-2xl" />
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#22a5b2]">
                    AssistDoc Digital Ticket
                  </p>
                  <h3 className="text-lg font-bold">Tiket Antrean Klinik</h3>
                </div>
                <Badge tone="cyan">{ticket.status}</Badge>
              </div>

              <div className="my-6 text-center">
                <p className="text-xs text-slate-300">Nomor Antrean Anda</p>
                <p className="mt-1 text-5xl font-black tracking-wider text-[#e7dcae]">
                  {ticket.queueNumber || `A0${ticket.id}`}
                </p>
                <p className="mt-2 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                  <Clock size={14} /> Estimasi Waktu Tunggu: ~{ticket.estimatedWaitMinutes || 15} Menit
                </p>
              </div>

              <div className="space-y-3 rounded-xl bg-white/5 p-4 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Nama Pasien</span>
                  <span className="font-bold">{ticket.patient?.name}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Poli Tujuan</span>
                  <span className="font-bold">{ticket.poli?.name || "Poli Umum"}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Dokter</span>
                  <span className="font-bold">{ticket.doctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Waktu Daftar</span>
                  <span className="font-mono text-xs">{new Date(ticket.visitDate).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</span>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-400">
                Silakan tunjukkan tiket ini saat tiba di area penerimaan klinik.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400 mb-3">
                <Stethoscope size={24} />
              </div>
              <h3 className="font-bold text-[#101a3d]">Belum Ada Tiket Aktif</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                Isi form di samping untuk mendaftar antrean online dan mendapatkan tiket antrean digital secara otomatis.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
