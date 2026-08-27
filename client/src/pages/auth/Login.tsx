import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/auth";
const roles: [UserRole, string, string][] = [
  ["ADMIN", "Admin", "admin@assistdoc.com"],
  ["DOCTOR", "Dokter", "doctor@assistdoc.com"],
  ["NURSE", "Perawat", "nurse@assistdoc.com"],
  ["PHARMACIST", "Apoteker", "pharmacist@assistdoc.com"],
  ["PATIENT", "Pasien", "patient@assistdoc.com"],
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
  const [role, setRole] = useState<UserRole>("ADMIN");
  const [email, setEmail] = useState("admin@assistdoc.com"),
    [password, setPassword] = useState("Admin12345"),
    [show, setShow] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  function choose(r: UserRole, e: string) {
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
      const r = await login({ email, password });
      save(r.data.token, r.data.user);
      nav(path(r.data.user.role), { replace: true });
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          "Login gagal. Periksa email dan password.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthLayout>
      <div className="w-full max-w-[480px]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#101a3d] text-white shadow-lg">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-3xl font-black text-[#101a3d]">
            AssistDoc Login
          </h2>
          <p className="mt-2 text-sm text-[#7b8497]">
            Choose your role to enter the correct clinic workspace.
          </p>
        </div>
        <form
          onSubmit={submit}
          className="rounded-3xl border border-[#dedbd2] bg-white p-6 shadow-sm sm:p-7"
        >
          <div className="mb-6 grid grid-cols-5 overflow-hidden rounded-xl border border-[#dedbd2]">
            {roles.map(([v, l, e]) => (
              <button
                key={v}
                type="button"
                onClick={() => choose(v, e)}
                className={`px-1 py-3 text-[10px] font-black sm:text-xs ${role === v ? "bg-[#f0f8f8] text-[#168c9b]" : "text-[#7b8497] hover:bg-[#faf8f2]"}`}
              >
                {l}
              </button>
            ))}
          </div>
          {error && (
            <div className="mb-4 rounded-xl bg-[#fff0ed] p-3 text-sm font-semibold text-[#a13e34]">
              {error}
            </div>
          )}
          <label className="mb-2 block text-sm font-black text-[#101a3d]">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="ad-input mb-4"
            placeholder="nama@klinik.id"
          />
          <label className="mb-2 block text-sm font-black text-[#101a3d]">
            Password
          </label>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={show ? "text" : "password"}
              required
              className="ad-input pr-12"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8497]"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button
            disabled={loading}
            className="ad-btn ad-btn-primary mt-6 w-full py-3.5"
          >
            {loading
              ? "Signing in..."
              : `Login as ${roles.find((r) => r[0] === role)?.[1]}`}
          </button>
          <p className="mt-5 text-center text-sm text-[#7b8497]">
            Belum punya akun?{" "}
            <Link className="font-black text-[#168c9b]" to="/signup">
              Create account
            </Link>
          </p>
        </form>
        <p className="mt-4 text-center text-xs text-[#969b9f]">
          Demo password semua role: <b>Admin12345</b>
        </p>
      </div>
    </AuthLayout>
  );
}
