import PageHeader from "../../components/common/PageHeader";
import { useEffect, useState } from "react";
import { clinic, unwrap } from "../../services/clinicService";
import { Bell, Calendar, Plus, CheckCircle2 } from "lucide-react";
import Badge from "../../components/common/Badge";

export default function PatientSchedule() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    patientId: 1,
    type: "KONTROL",
    title: "",
    date: "",
    notes: "",
  });

  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const res = await clinic.reminders();
      const data = unwrap(res);
      setReminders(data);
    } catch {
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  async function handleAddReminder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      await clinic.createReminder(form);
      setMsg("Pengingat kontrol berhasil dibuat!");
      setShowModal(false);
      setForm({ patientId: 1, type: "KONTROL", title: "", date: "", notes: "" });
      loadReminders();
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Gagal membuat pengingat.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleStatus(id: number, currentStatus: string) {
    const nextStatus = currentStatus === "COMPLETED" ? "PENDING" : "COMPLETED";
    try {
      await clinic.updateReminderStatus(id, nextStatus);
      loadReminders();
    } catch (err: any) {
      console.error(err);
    }
  }

  return (
    <>
      <PageHeader
        title="Pengingat Kontrol & Jadwal Layanan"
        subtitle="Notifikasi jadwal kontrol ulang, vaksinasi, dan pemeriksaan laboratorium pasien."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#168c9b] px-4 py-2 text-sm font-bold text-white shadow-lg hover:bg-[#12727f] transition"
          >
            <Plus size={16} />
            Tambah Pengingat Kontrol
          </button>
        }
      />

      {msg && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} />
          {msg}
        </div>
      )}

      {/* LIST PENGINGAT */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reminders.map((r) => {
          const isDone = r.status === "COMPLETED";
          return (
            <div
              key={r.id}
              className={`rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between ${isDone ? "border-slate-200 bg-slate-50 opacity-75" : "border-slate-200 bg-white"
                }`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <Badge
                    tone={
                      r.type === "KONTROL"
                        ? "cyan"
                        : r.type === "VAKSINASI"
                          ? "emerald"
                          : "violet"
                    }
                  >
                    {r.type}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(r.date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className={`font-bold text-base ${isDone ? "line-through text-slate-500" : "text-[#101a3d]"}`}>
                    {r.title}
                  </h3>
                  {r.notes && <p className="text-xs text-slate-500 mt-1">{r.notes}</p>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">
                  Status: {r.status}
                </span>
                <button
                  onClick={() => toggleStatus(r.id, r.status)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${isDone
                      ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                >
                  {isDone ? "Tandai Belum" : "Selesaikan"}
                </button>
              </div>
            </div>
          );
        })}

        {!loading && reminders.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Bell className="mx-auto text-slate-400 mb-2" size={32} />
            <h3 className="font-bold text-[#101a3d]">Belum Ada Pengingat Kontrol</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Klik tombol "Tambah Pengingat Kontrol" di atas untuk menjadwalkan pemeriksaan ulang atau vaksinasi.
            </p>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH PENGINGAT */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#101a3d]">Buat Pengingat Kontrol Baru</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwalkan pengingat tanggal kontrol ulang, imunisasi, atau tes laboratorium.
            </p>

            <form onSubmit={handleAddReminder} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Tipe Pengingat *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
                >
                  <option value="KONTROL">Kontrol Ulang Dokter</option>
                  <option value="VAKSINASI">Vaksinasi / Imunisasi</option>
                  <option value="CEK_LAB">Cek Laboratorium</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Judul Pengingat *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Contoh: Kontrol Rutin Tensi Poli Umum"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tanggal Pengingat *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Contoh: Bawa hasil tes darah sebelumnya..."
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[#168c9b] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-[#12727f] transition disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Pengingat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
