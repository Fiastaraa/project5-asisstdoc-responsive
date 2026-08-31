import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building2, UserCheck, ShieldCheck } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/auth";

type PortalType = "KLINIK" | "PASIEN";

const staffRoles: [UserRole, string, string][] = [
  ["ADMIN", "Admin Klinik", "admin@assistdoc.com"],
  ["DOCTOR", "Dokter", "doctor@assistdoc.com"],
  ["NURSE", "Perawat", "nurse@assistdoc.com"],
  ["PHARMACIST", "Apoteker", "pharmacist@assistdoc.com"],
];

const path = (r: UserRole) =>
  r === "ADMIN"
    ? "/dashboard/admin"
    : r === "DOCTOR"
      ? "/dashboard/doctor"
      : r === "NURSE"
        ? "/dashboard/nurse"
        : r === "PHARMACIST"
          ? "/dashboard/pharmacist"
          : "/dashboard/patient";

export default function Login() {
  const nav = useNavigate();
  const { login: save } = useAuth();

  const [portal, setPortal] = useState<PortalType>("PASIEN");
  const [role, setRole] = useState<UserRole>("PATIENT");
  const [email, setEmail] = useState("patient@assistdoc.com");
  const [password, setPassword] = useState("Admin12345");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchPortal(p: PortalType) {
    setPortal(p);
    setError("");
    if (p === "PASIEN") {
      setRole("PATIENT");
      setEmail("patient@assistdoc.com");
      setPassword("Admin12345");
    } else {
      setRole("ADMIN");
      setEmail("admin@assistdoc.com");
      setPassword("Admin12345");
    }
  }

  function selectStaff(r: UserRole, e: string) {
    setRole(r);
    setEmail(e);
    setPassword("Admin12345");
    setError("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await login({ email: email.trim(), password });
      save(r.data.token, r.data.user);
      nav(path(r.data.user.role), { replace: true });
    } catch (e: any) {
      const serverMessage = e?.response?.data?.message;
      if (serverMessage === "Invalid email or password") {
        setError("Email atau password yang Anda masukkan salah. Silakan periksa kembali.");
      } else if (e?.code === "ERR_NETWORK" || !e?.response) {
        setError("Gagal terhubung ke server backend (Port 3001). Pastikan server aktif.");
      } else {
        setError(serverMessage || "Login gagal. Periksa email dan password Anda.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[480px]">
        {/* LOGO & TITLE */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[#101a3d] text-[#22a5b2] shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-black text-[#101a3d]">AssistDoc</h2>
          <p className="mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
            Clinic Outpatient Management System
          </p>
        </div>

        {/* TAB PORTAL SELECTION */}
        <div className="mb-4 grid grid-cols-2 p-1 bg-slate-200/80 rounded-2xl">
          <button
            type="button"
            onClick={() => switchPortal("PASIEN")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition ${
              portal === "PASIEN"
                ? "bg-[#168c9b] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck size={16} /> Client Pasien
          </button>

          <button
            type="button"
            onClick={() => switchPortal("KLINIK")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition ${
              portal === "KLINIK"
                ? "bg-[#101a3d] text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 size={16} /> Client Klinik (Staff)
          </button>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl border border-[#dedbd2] bg-white p-6 shadow-sm sm:p-7"
        >
          {/* STAFF ROLE QUICK SELECTOR */}
          {portal === "KLINIK" && (
            <div className="mb-6">
              <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pilih Peran Operasional Klinik
              </label>
              <div className="grid grid-cols-2 gap-2">
                {staffRoles.map(([v, l, e]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => selectStaff(v, e)}
                    className={`rounded-xl border p-2.5 text-left text-xs font-bold transition ${
                      role === v
                        ? "border-[#101a3d] bg-[#101a3d] text-white shadow"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASIEN HELPER TEXT */}
          {portal === "PASIEN" && (
            <div className="mb-5 rounded-2xl bg-cyan-50 border border-cyan-200 p-3.5 text-xs text-cyan-950">
              <p className="font-bold">Masuk Portal Pasien</p>
              <p className="mt-0.5 text-slate-600">
                Gunakan alamat email & password akun Pasien terdaftar Anda untuk melihat rekam medis, antrean, dan invoice.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-bold text-rose-800">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black text-[#101a3d] uppercase tracking-wider">
                Alamat Email Pasien / Staff
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold focus:border-[#168c9b] focus:outline-none"
                placeholder="pasien@assistdoc.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black text-[#101a3d] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={show ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold pr-12 focus:border-[#168c9b] focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            className={`mt-6 w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition ${
              portal === "PASIEN"
                ? "bg-[#168c9b] hover:bg-[#12727f]"
                : "bg-[#101a3d] hover:bg-[#0c132d]"
            } disabled:opacity-50`}
          >
            {loading
              ? "Memproses Login..."
              : portal === "PASIEN"
                ? "Masuk ke Client Pasien"
                : `Masuk sebagai ${staffRoles.find((r) => r[0] === role)?.[1]}`}
          </button>

          {portal === "PASIEN" && (
            <p className="mt-5 text-center text-xs text-slate-500">
              Belum memiliki akun pasien?{" "}
              <Link className="font-black text-[#168c9b] underline" to="/signup">
                Daftar Akun Pasien Baru
              </Link>
            </p>
          )}
        </form>

        <div className="mt-4 rounded-xl bg-slate-100 p-3 text-center text-[11px] text-slate-500 font-medium">
          Password Demo Standar: <b className="text-[#101a3d]">Admin12345</b>
        </div>
      </div>
    </AuthLayout>
  );
}
