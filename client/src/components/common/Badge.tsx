export default function Badge({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  const m: any = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
    cyan: "bg-cyan-100 text-cyan-700",
    emerald: "bg-emerald-100 text-emerald-700",
    rose: "bg-rose-100 text-rose-700",
    violet: "bg-violet-100 text-violet-700",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${m[tone] || m.slate}`}
    >
      {children}
    </span>
  );
}
