import type { LucideIcon } from "lucide-react";
export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "indigo",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "indigo" | "cyan" | "emerald" | "amber" | "rose" | "violet";
  hint?: string;
}) {
  const tones = {
    indigo: "bg-[#101a3d] text-white",
    cyan: "bg-[#168c9b] text-white",
    emerald: "bg-[#dff4e8] text-[#21704b]",
    amber: "bg-[#f6ebc8] text-[#806a1b]",
    rose: "bg-[#f9ded9] text-[#a13e34]",
    violet: "bg-[#e9e3fb] text-[#5c43a6]",
  };
  return (
    <div className="ad-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.12em] text-[#7b8497]">
            {label}
          </p>
          <p className="mt-2 text-3xl font-black text-[#101a3d]">{value}</p>
          {hint && <p className="mt-1 text-xs text-[#7b8497]">{hint}</p>}
        </div>
        <div
          className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
