import type { ReactNode } from "react";
export default function WorkspaceCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="ad-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-[#ece8df] bg-[#101a3d] p-5 text-white">
        <div>
          <h2 className="font-black">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-300">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
