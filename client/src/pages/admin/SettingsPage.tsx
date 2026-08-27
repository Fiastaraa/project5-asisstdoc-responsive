import PageHeader from "../../components/common/PageHeader";
export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Clinic configuration reference." />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold">Invoice Configuration</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b py-3">
              <span>Consultation fee</span>
              <b>Rp 30.000</b>
            </div>
            <div className="flex justify-between border-b py-3">
              <span>Admin fee</span>
              <b>Rp 5.000</b>
            </div>
            <div className="flex justify-between py-3">
              <span>Tax</span>
              <b>18%</b>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold">Workflow</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Registration → Nurse vitals → Doctor consultation → Pharmacy →
            Automatic invoice → Admin payment.
          </p>
        </div>
      </div>
    </>
  );
}
