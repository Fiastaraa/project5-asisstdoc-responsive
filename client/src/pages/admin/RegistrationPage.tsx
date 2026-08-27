import { useEffect, useState, type FormEvent } from "react";
import PageHeader from "../../components/common/PageHeader";
import { clinic, unwrap } from "../../services/clinicService";
import { CheckCircle2 } from "lucide-react";
export default function RegistrationPage() {
  const [patients, setPatients] = useState<any[]>([]),
    [doctors, setDoctors] = useState<any[]>([]),
    [existing, setExisting] = useState(""),
    [form, setForm] = useState({
      name: "",
      gender: "Female",
      age: "",
      phone: "",
      address: "",
    }),
    [doctorId, setDoctorId] = useState(""),
    [complaint, setComplaint] = useState(""),
    [msg, setMsg] = useState("");
  useEffect(() => {
    Promise.all([clinic.patients(), clinic.doctors()]).then(([p, d]) => {
      setPatients(unwrap(p));
      setDoctors(unwrap(d));
      if (unwrap(d)[0]) setDoctorId(String(unwrap(d)[0].id));
    });
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    try {
      let patientId = Number(existing);
      if (!patientId) {
        patientId = unwrap(
          await clinic.createPatient({
            name: form.name,
            gender: form.gender,
            age: Number(form.age),
            phone: form.phone,
            address: form.address,
          }),
        ).id;
      }
      await clinic.createVisit({
        patientId,
        doctorId: Number(doctorId),
        complaint,
      });
      setMsg("Registration berhasil dan pasien masuk antrean.");
      setExisting("");
      setForm({ name: "", gender: "Female", age: "", phone: "", address: "" });
      setComplaint("");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Registration gagal.");
    }
  }
  return (
    <>
      <PageHeader
        title="New Registration"
        subtitle="Existing patient or create a new patient, then check-in to queue."
      />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <form
          onSubmit={submit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setExisting(existing || "")}
              className="rounded-lg bg-white py-2 text-sm font-semibold shadow-sm"
            >
              Existing Patient
            </button>
            <span className="py-2 text-center text-sm text-slate-500">
              New Patient
            </span>
          </div>
          <label className="text-sm font-semibold">
            Select Existing Patient
          </label>
          <select
            value={existing}
            onChange={(e) => setExisting(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
          >
            <option value="">-- Create new patient --</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.phone}
              </option>
            ))}
          </select>
          <div className="my-5 h-px bg-slate-100" />
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              disabled={!!existing}
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              disabled={!!existing}
            />
            <Field
              label="Age"
              value={form.age}
              onChange={(v) => setForm((f) => ({ ...f, age: v }))}
              type="number"
              disabled={!!existing}
            />
            <div>
              <label className="text-sm font-semibold">Gender</label>
              <select
                disabled={!!existing}
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gender: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
              >
                <option>Female</option>
                <option>Male</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-semibold">Address</label>
            <textarea
              disabled={!!existing}
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              className="mt-2 min-h-24 w-full rounded-xl border border-slate-200 p-3"
            />
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">Doctor</label>
              <select
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Initial Complaint</label>
              <input
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3"
                placeholder="Demam, batuk..."
              />
            </div>
          </div>
          <button className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white">
            Check-in & Add to Queue
          </button>
          {msg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 size={17} />
              {msg}
            </div>
          )}
        </form>
        <div className="rounded-2xl bg-[#111a3a] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
            Today's Queue
          </p>
          <h2 className="mt-2 text-2xl font-bold">Registration flow</h2>
          <ol className="mt-6 space-y-4 text-sm text-slate-200">
            <li>01 · Search patient</li>
            <li>02 · Create patient if needed</li>
            <li>03 · Assign doctor & complaint</li>
            <li>04 · Check-in to waiting queue</li>
            <li>05 · Nurse performs initial assessment</li>
          </ol>
        </div>
      </div>
    </>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        disabled={disabled}
        required={!disabled}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 disabled:bg-slate-50"
      />
    </div>
  );
}
