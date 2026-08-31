import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";
import { register } from "../../services/authService";
import type { UserRole } from "../../types/auth";
import { UserCheck, ShieldCheck } from "lucide-react";

const roles: [UserRole, string][] = [
  ["PATIENT", "Pasien (Client Pasien)"],
  ["ADMIN", "Admin Klinik"],
  ["DOCTOR", "Dokter"],
  ["NURSE", "Perawat"],
  ["PHARMACIST", "Apoteker"],
];

export default function SignUp() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "PATIENT" as UserRole,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm)
      return setError("Password dan konfirmasi password tidak cocok.");

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      nav("/login");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Gagal membuat akun pasien.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[#168c9b] text-white shadow-lg">
            <UserCheck size={26} />
          </div>
          <h2 className="text-2xl font-black text-[#101a3d]">Pendaftaran Akun Pasien Baru</h2>
          <p className="mt-1 text-xs text-slate-500">
            Buat akun untuk mendaftar antrean online dan melihat riwayat medis Anda.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-800">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Tipe Akun *</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(([v, l]) => (
                <button
                  type="button"
                  key={v}
                  onClick={() => set("role", v)}
                  className={`rounded-xl border p-2.5 text-left text-xs font-bold transition ${
                    form.role === v
                      ? "border-[#168c9b] bg-[#168c9b] text-white shadow"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Nama Lengkap Pasien *</label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Budi Santoso"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Email Pasien *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Password (Minimal 8 Karakter) *</label>
              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">Konfirmasi Password *</label>
              <input
                required
                type="password"
                minLength={8}
                value={form.confirm}
                onChange={(e) => set("confirm", e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-[#168c9b] py-3 text-sm font-bold text-white shadow-lg hover:bg-[#12727f] transition disabled:opacity-50"
          >
            {loading ? "Membuat Akun..." : "Daftar Akun Sekarang"}
          </button>

          <p className="mt-4 text-center text-xs text-slate-500">
            Sudah memiliki akun?{" "}
            <Link to="/login" className="font-bold text-[#168c9b] underline">
              Login ke Portal
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
