import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { clinic, unwrap } from "../../services/clinicService";

type Visit = {
  id: number;
  status: string;
  complaint?: string | null;
  patient?: {
    id: number;
    name: string;
  };
};

type VitalForm = {
  bloodPressure: string;
  temperature: string;
  weight: string;
  height: string;
  notes: string;
};

export default function Vitals() {
  const [params] = useSearchParams();

  const requestedId = Number(params.get("visitId") || 0);

  const [rows, setRows] = useState<Visit[]>([]);
  const [selected, setSelected] = useState<Visit | null>(null);

  const [form, setForm] = useState<VitalForm>({
    bloodPressure: "120/80",
    temperature: "37.2",
    weight: "60",
    height: "165",
    notes: "",
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadVisits() {
      try {
        setLoading(true);

        const response = await clinic.visits();

        const visits = unwrap(response) as Visit[];

        const waiting = visits.filter((visit) => visit.status === "WAITING");

        if (!mounted) return;

        setRows(waiting);

        if (requestedId) {
          const found = waiting.find((visit) => visit.id === requestedId);

          if (found) {
            setSelected(found);
          }
        }
      } catch (error: any) {
        if (!mounted) return;

        setMsg(
          error?.response?.data?.message || "Failed to load waiting patients.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadVisits();

    return () => {
      mounted = false;
    };
  }, [requestedId]);

  function updateForm(field: keyof VitalForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function save() {
    if (!selected) {
      setMsg("Please select a patient first.");
      return;
    }

    try {
      setSaving(true);
      setMsg("");

      await clinic.vitals(selected.id, {
        bloodPressure: form.bloodPressure,
        temperature: Number(form.temperature),
        weight: Number(form.weight),
        height: Number(form.height),
        notes: form.notes,
      });

      setMsg(
        "Vitals saved successfully. Patient is ready for the doctor queue.",
      );

      // Remove the patient from the nurse waiting list
      setRows((previous) =>
        previous.filter((visit) => visit.id !== selected.id),
      );

      setSelected(null);

      setForm({
        bloodPressure: "120/80",
        temperature: "37.2",
        weight: "60",
        height: "165",
        notes: "",
      });
    } catch (error: any) {
      setMsg(error?.response?.data?.message || "Failed to save vital signs.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Record Vitals"
        subtitle="Record blood pressure, temperature, weight, height and notes."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        {/* Waiting Patients */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Waiting Patients
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Patients waiting for initial assessment.
              </p>
            </div>

            <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700">
              {rows.length}
            </span>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="mt-5 rounded-xl bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-600">
                No waiting patients
              </p>

              <p className="mt-1 text-sm text-slate-400">
                New patients will appear here after registration.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {rows.map((visit) => (
                <button
                  key={visit.id}
                  type="button"
                  onClick={() => setSelected(visit)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selected?.id === visit.id
                      ? "border-cyan-500 bg-cyan-50"
                      : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">
                        {visit.patient?.name || "Unknown Patient"}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {visit.complaint || "No complaint recorded"}
                      </p>
                    </div>

                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      Waiting
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vital Form */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          {selected ? (
            <>
              <div className="border-b pb-5">
                <p className="text-sm font-medium text-slate-500">
                  Selected Patient
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {selected.patient?.name || "Unknown Patient"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Visit #{selected.id}
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Blood Pressure */}
                <div>
                  <label
                    htmlFor="bloodPressure"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Blood Pressure
                  </label>

                  <input
                    id="bloodPressure"
                    value={form.bloodPressure}
                    onChange={(event) =>
                      updateForm("bloodPressure", event.target.value)
                    }
                    placeholder="120/80"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                {/* Temperature */}
                <div>
                  <label
                    htmlFor="temperature"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Temperature (°C)
                  </label>

                  <input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={form.temperature}
                    onChange={(event) =>
                      updateForm("temperature", event.target.value)
                    }
                    placeholder="37.2"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label
                    htmlFor="weight"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Weight (kg)
                  </label>

                  <input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(event) =>
                      updateForm("weight", event.target.value)
                    }
                    placeholder="60"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                {/* Height */}
                <div>
                  <label
                    htmlFor="height"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Height (cm)
                  </label>

                  <input
                    id="height"
                    type="number"
                    step="0.1"
                    value={form.height}
                    onChange={(event) =>
                      updateForm("height", event.target.value)
                    }
                    placeholder="165"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="mt-5">
                <label
                  htmlFor="notes"
                  className="text-sm font-semibold text-slate-700"
                >
                  Notes
                </label>

                <textarea
                  id="notes"
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Additional assessment notes..."
                  className="mt-2 min-h-32 w-full resize-none rounded-xl border border-slate-200 p-3 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              {/* Save */}
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="mt-6 w-full rounded-xl bg-cyan-600 py-3 font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Vitals"}
              </button>

              {msg && (
                <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                  {msg}
                </p>
              )}
            </>
          ) : (
            <div className="flex min-h-[500px] items-center justify-center text-center">
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  🩺
                </div>

                <h2 className="mt-4 text-lg font-bold text-slate-700">
                  Select a patient
                </h2>

                <p className="mt-1 max-w-sm text-sm text-slate-400">
                  Select a waiting patient from the list to record their vital
                  signs.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
