import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock3,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  Pill,
  Receipt,
  BarChart3,
  CalendarDays,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Package,
  UserRound,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/auth";

type NavItem = { label: string; path: string; icon: LucideIcon };
type RoleConfig = { label: string; short: string; items: NavItem[] };

const createItems = (
  items: readonly (readonly [string, string, LucideIcon])[],
): NavItem[] => items.map(([label, path, icon]) => ({ label, path, icon }));

const configs: Record<UserRole, RoleConfig> = {
  ADMIN: {
    label: "Administrator",
    short: "Admin",
    items: createItems([
      ["Dashboard", "/dashboard/admin", LayoutDashboard],
      ["Data Pasien", "/dashboard/admin/patients", Users],
      ["Check-in Antrean Poli", "/dashboard/admin/registration", UserPlus],
      ["Antrean Digital", "/dashboard/admin/queue", Clock3],
      ["Invoice & Pembayaran", "/dashboard/admin/invoices", Receipt],
      ["Laporan & Analitik", "/dashboard/admin/reports", BarChart3],
      ["Kelola User", "/dashboard/admin/users", UserRound],
      ["Pengaturan", "/dashboard/admin/settings", Settings],
    ]),
  },
  DOCTOR: {
    label: "Doctor",
    short: "Doctor",
    items: createItems([
      ["Dashboard", "/dashboard/doctor", LayoutDashboard],
      ["Patient Queue", "/dashboard/doctor/queue", Clock3],
      ["Patient Info", "/dashboard/doctor/patients", Users],
      ["Consultation", "/dashboard/doctor/consultation", Stethoscope],
      ["Diagnosis", "/dashboard/doctor/diagnosis", ClipboardList],
      ["Prescriptions", "/dashboard/doctor/prescriptions", Pill],
      ["Medical Notes", "/dashboard/doctor/notes", FileText],
      ["Schedule", "/dashboard/doctor/schedule", CalendarDays],
    ]),
  },
  NURSE: {
    label: "Nurse",
    short: "Nurse",
    items: createItems([
      ["Dashboard", "/dashboard/nurse", LayoutDashboard],
      ["Patient Queue", "/dashboard/nurse/queue", Clock3],
      ["Patient Search", "/dashboard/nurse/search", Search],
      ["Patient Info & Vitals", "/dashboard/nurse/patient", Users],
      ["Initial Assessment", "/dashboard/nurse/assessment", ClipboardList],
      ["Record Vitals", "/dashboard/nurse/vitals", HeartPulse],
      ["Notes & Tasks", "/dashboard/nurse/notes", FileText],
      ["Schedule", "/dashboard/nurse/schedule", CalendarDays],
    ]),
  },
  PHARMACIST: {
    label: "Pharmacist",
    short: "Pharmacist",
    items: createItems([
      ["Dashboard", "/dashboard/pharmacist", LayoutDashboard],
      ["Prescription Queue", "/dashboard/pharmacist/queue", Clock3],
      ["Medicine Inventory", "/dashboard/pharmacist/inventory", Package],
      ["Prescription Detail", "/dashboard/pharmacist/prescriptions", Pill],
      ["Stock Management", "/dashboard/pharmacist/stock", Package],
      ["Notifications", "/dashboard/pharmacist/notifications", Bell],
      ["Reports & Analytics", "/dashboard/pharmacist/reports", BarChart3],
      ["Schedule", "/dashboard/pharmacist/schedule", CalendarDays],
    ]),
  },
  PATIENT: {
    label: "Patient",
    short: "Patient",
    items: createItems([
      ["Dashboard", "/dashboard/patient", LayoutDashboard],
      ["Online Registration", "/dashboard/patient/registration", UserPlus],
      ["My Queue", "/dashboard/patient/queue", Clock3],
      ["Visit History", "/dashboard/patient/history", FileText],
      ["Invoices", "/dashboard/patient/invoices", Receipt],
      ["Schedule", "/dashboard/patient/schedule", CalendarDays],
    ]),
  },
};

export default function RoleLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const cfg = configs[user.role];

  return (
    <div className="ad-shell">
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col bg-[#101a3d] text-white transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#22a5b2] text-xl font-black text-white shadow-lg">
            +
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">AssistDoc</p>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
              {cfg.short} workspace
            </p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <X size={19} />
          </button>
        </div>
        <div className="px-3 py-5">
          <p className="px-3 pb-3 text-[10px] font-black uppercase tracking-[.2em] text-slate-500">
            Main Menu
          </p>
          <nav className="space-y-1">
            {cfg.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === `/dashboard/${user.role.toLowerCase()}`}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-bold transition ${isActive ? "bg-[#168c9b] text-white shadow-lg shadow-cyan-950/20" : "text-slate-300 hover:bg-white/8 hover:text-white"}`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e7dcae] font-black text-[#101a3d]">
              {user.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-[11px] text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-200 hover:bg-rose-500/10"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e2dfd7] bg-[#fdfbf6]/95 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 hover:bg-white lg:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </button>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#168c9b]">
                Clinic Outpatient Management
              </p>
              <h1 className="text-lg font-black text-[#101a3d] md:text-xl">
                {cfg.label} Dashboard
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-black text-[#101a3d]">{user.name}</p>
              <p className="text-[11px] font-semibold text-slate-400">
                {cfg.label}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e7dcae] font-black text-[#101a3d]">
              {user.name[0]?.toUpperCase()}
            </div>
          </div>
        </header>
        <main className="min-h-[calc(100vh-76px)] p-4 md:p-6 xl:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
