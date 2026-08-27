export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#168c9b]">
          AssistDoc Clinic
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-[#101a3d]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-[#7b8497]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
