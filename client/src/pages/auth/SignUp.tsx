import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { register } from "../../services/authService";
import type { UserRole } from "../../types/auth";
const roles: [UserRole, string][] = [
  ["ADMIN", "Admin"],
  ["DOCTOR", "Dokter"],
  ["NURSE", "Perawat"],
  ["PHARMACIST", "Apoteker"],
  ["PATIENT", "Pasien"],
];
export default function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "ADMIN" as UserRole,
  });
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm)
      return setError("Password dan konfirmasi tidak sama.");
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      nav("/login");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal membuat akun.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout>
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
      >
        <h2 className="text-2xl font-bold">Create Account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Buat akun staff/patient AssistDoc.
        </p>
        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          {roles.map(([v, l]) => (
            <button
              type="button"
              key={v}
              onClick={() => set("role", v)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${form.role === v ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-500"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-4">
          {[
            ["name", "Full Name", "text"],
            ["email", "Email", "email"],
            ["password", "Password", "password"],
            ["confirm", "Confirm Password", "password"],
          ].map(([k, l, t]) => (
            <div key={k}>
              <label className="mb-2 block text-sm font-semibold">{l}</label>
              <input
                required
                type={t}
                value={(form as any)[k]}
                onChange={(e) => set(k, e.target.value)}
                minLength={k === "password" || k === "confirm" ? 8 : undefined}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>
          ))}
        </div>
        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="font-semibold text-indigo-600">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
