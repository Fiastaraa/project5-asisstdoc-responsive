import { useEffect, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import { clinic, unwrap } from "../../services/clinicService";
export default function Inventory() {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    clinic.medicines().then((r) => setRows(unwrap(r)));
  }, []);
  return (
    <>
      <PageHeader
        title="Medicine Inventory"
        subtitle="Medicine name, dosage, stock and price."
      />
      <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111a3a] text-white">
            <tr>
              <th className="px-5 py-4">Medicine</th>
              <th>Dosage</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-5 py-4 font-semibold">{m.name}</td>
                <td>{m.dosage}</td>
                <td
                  className={
                    m.stock < 20 ? "font-bold text-rose-600" : "font-semibold"
                  }
                >
                  {m.stock}
                </td>
                <td>Rp {Number(m.price).toLocaleString("id-ID")}</td>
                <td>
                  <button className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
