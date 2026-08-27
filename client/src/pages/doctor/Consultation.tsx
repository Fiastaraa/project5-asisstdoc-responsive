import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { clinic, unwrap } from "../../services/clinicService";
export default function Consultation() {
  const [params] = useSearchParams();
  const requestedId = Number(params.get("visitId") || 0);
  const [rows, setRows] = useState<any[]>([]),
    [meds, setMeds] = useState<any[]>([]),
    [selected, setSelected] = useState<any>(null),
    [diagnosis, setDiagnosis] = useState("Flu & Cough"),
    [notes, setNotes] = useState("Rest and drink fluids"),
    [med, setMed] = useState(""),
    [qty, setQty] = useState("1"),
    [msg, setMsg] = useState("");
  useEffect(() => {
    Promise.all([clinic.visits(), clinic.medicines()]).then(([v, m]) => {
      const a = unwrap(v),
        b = unwrap(m);
      setRows(a.filter((x: any) => x.status === "IN_CONSULTATION"));
      setMeds(b);
      const requested = a.find(
        (x: any) => x.id === requestedId && x.status === "IN_CONSULTATION",
      );
      setSelected(
        requested || a.find((x: any) => x.status === "IN_CONSULTATION") || null,
      );
    });
  }, []);
  async function finish() {
    if (!selected) return;
    try {
      await clinic.diagnosis({
        visitId: selected.id,
        diagnosisName: diagnosis,
        notes,
      });
      if (med)
        await clinic.prescription({
          visitId: selected.id,
          medicineId: Number(med),
          quantity: Number(qty),
        });
      await clinic.status(selected.id, "COMPLETED");
      setMsg("Consultation selesai. Prescription dikirim ke pharmacy.");
    } catch (e: any) {
      setMsg(e?.response?.data?.message || "Failed");
    }
  }
  return (
    <>
      <PageHeader
        title="Consultation"
        subtitle="Diagnosis, prescription and medical notes."
      />
      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold">Patient Queue</h2>
          <div className="mt-4 space-y-2">
            {rows.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                className={`w-full rounded-xl border p-3 text-left ${selected?.id === v.id ? "border-indigo-500 bg-indigo-50" : "border-slate-100"}`}
              >
                <p className="font-semibold">{v.patient.name}</p>
                <p className="text-xs text-slate-500">
                  {v.patient.age} · {v.patient.gender}
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {selected ? (
            <>
              <div className="rounded-xl bg-[#111a3a] p-4 text-white">
                <p className="text-xs text-slate-300">Patient</p>
                <h2 className="text-xl font-bold">{selected.patient.name}</h2>
                <p className="text-sm">
                  Complaint: {selected.complaint || "-"}
                </p>
                <p className="text-sm">
                  Vitals: {selected.bloodPressure || "-"} ·{" "}
                  {selected.temperature || "-"}°C · {selected.weight || "-"}kg
                </p>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Diagnosis</label>
                  <input
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="mt-2 w-full rounded-xl border px-3 py-3"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Medicine</label>
                  <select
                    value={med}
                    onChange={(e) => setMed(e.target.value)}
                    className="mt-2 w-full rounded-xl border px-3 py-3"
                  >
                    <option value="">No medicine</option>
                    {meds.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {m.dosage} · Rp{" "}
                        {Number(m.price).toLocaleString("id-ID")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-semibold">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-28 w-full rounded-xl border p-3"
                />
              </div>
              {med && (
                <div className="mt-4">
                  <label className="text-sm font-semibold">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="mt-2 w-32 rounded-xl border px-3 py-3"
                  />
                </div>
              )}
              <button
                onClick={finish}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-bold text-white"
              >
                Finish Consultation
              </button>
              {msg && (
                <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                  {msg}
                </p>
              )}
            </>
          ) : (
            <div className="py-20 text-center text-slate-400">
              Select a patient from the queue.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
