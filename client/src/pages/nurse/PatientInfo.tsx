import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { clinic, unwrap } from "../../services/clinicService";
export default function PatientInfo() {
  const [v, setV] = useState<any>(null);
  useEffect(() => {
    clinic.visits().then((r) => setV(unwrap(r)[0]));
  }, []);
  return (
    <>
      <PageHeader
        title="Patient Info & Vitals"
        subtitle="Patient demographics and latest examination."
      />
      {v ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Patient Details">
            <Row a="Name" b={v.patient.name} />
            <Row a="Age" b={String(v.patient.age)} />
            <Row a="Gender" b={v.patient.gender} />
            <Row a="Phone" b={v.patient.phone} />
          </Card>
          <Card title="Vital Signs">
            <Row a="Blood Pressure" b={v.bloodPressure || "Not recorded"} />
            <Row
              a="Temperature"
              b={v.temperature ? `${v.temperature} °C` : "Not recorded"}
            />
            <Row a="Weight" b={v.weight ? `${v.weight} kg` : "Not recorded"} />
            <Row a="Height" b={v.height ? `${v.height} cm` : "Not recorded"} />
          </Card>
        </div>
      ) : null}
    </>
  );
}
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="rounded-xl bg-[#111a3a] p-3 font-bold text-white">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
function Row({ a, b }: { a: string; b: string }) {
  return (
    <div className="flex justify-between border-b py-3 text-sm">
      <span className="text-slate-500">{a}</span>
      <b>{b}</b>
    </div>
  );
}
