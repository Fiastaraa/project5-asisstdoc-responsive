import PageHeader from "../../components/common/PageHeader";
import { useEffect, useState } from "react";
import { clinic, unwrap } from "../../services/clinicService";
import { paymentService } from "../../services/paymentService";
import { downloadInvoicePdf } from "../../utils/invoicePdf";
import { Receipt, Download, CreditCard, CheckCircle2, AlertCircle } from "lucide-react";
import Badge from "../../components/common/Badge";

function formatRupiah(value = 0) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PatientInvoices() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "UNPAID" | "PAID">("ALL");
  const [payingInvoice, setPayingInvoice] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("MIDTRANS");
  const [msg, setMsg] = useState("");
  const [processing, setProcessing] = useState(false);


  const load = async () => {
    setLoading(true);
    try {
      const r = await clinic.visits();
      setRows(unwrap(r));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visitsWithInvoice = rows.filter((v) => v.invoice);

  const filteredVisits = visitsWithInvoice.filter((v) => {
    if (filterStatus === "UNPAID") return v.invoice?.status === "UNPAID";
    if (filterStatus === "PAID") return v.invoice?.status === "PAID";
    return true;
  });

  async function handlePaySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payingInvoice) return;
    setProcessing(true);
    setMsg("");
    try {
      if (paymentMethod === "MIDTRANS") {
        await paymentService.payWithSnap(payingInvoice.invoice.id, {
          onSuccess: (result) => {
            console.log("Midtrans Success:", result);
            setMsg("Pembayaran berhasil diselesaikan via Midtrans!");
            setPayingInvoice(null);
            load();
          },
          onPending: (result) => {
            console.log("Midtrans Pending:", result);
            setMsg("Menunggu penyelesaian pembayaran Midtrans. Silakan selesaikan pembayaran Anda.");
            setPayingInvoice(null);
            load();
          },
          onError: (err) => {
            console.error("Midtrans Error:", err);
            setMsg("Pembayaran Midtrans gagal atau dibatalkan.");
          },
          onClose: () => {
            setProcessing(false);
          },
        });
      } else {
        await clinic.pay(payingInvoice.invoice.id, paymentMethod);
        setMsg("Pembayaran berhasil diproses! Status tagihan diperbarui menjadi LUNAS.");
        setPayingInvoice(null);
        load();
      }
    } catch (err: any) {
      setMsg(err?.response?.data?.message || err?.message || "Pembayaran gagal, silakan coba lagi.");
    } finally {
      setProcessing(false);
    }
  }

  function triggerDownloadPdf(visit: any) {
    const inv = visit.invoice;
    if (!inv) return;

    const items = (visit.prescriptions || []).map((p: any) => ({
      name: p.medicine?.name,
      quantity: p.quantity,
      price: Number(p.medicine?.price || 0),
    }));

    downloadInvoicePdf({
      id: inv.id,
      invoiceNumber: `INV-${String(inv.id).padStart(5, "0")}`,
      patient: visit.patient,
      doctor: visit.doctor,
      visitDate: visit.visitDate,
      subtotal: Number(inv.subtotal),
      total: Number(inv.total),
      status: inv.status,
      items,
      payment: inv.payments && inv.payments.length > 0 ? { method: inv.payments[0].method } : undefined,
    });
  }

  return (
    <>
      <PageHeader
        title="Tagihan & Pembayaran Digital Pasien"
        subtitle="Rincian biaya konsultasi, obat, e-payment online, dan unduh PDF invoice resmi."
      />

      {/* FILTER TABS */}
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          {(["ALL", "UNPAID", "PAID"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filterStatus === tab
                  ? "bg-[#168c9b] text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab === "ALL" ? "Semua Tagihan" : tab === "UNPAID" ? "Belum Bayar" : "Lunas"}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 size={18} />
          {msg}
        </div>
      )}

      {/* INVOICE CARDS LIST */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredVisits.map((v) => {
          const inv = v.invoice;
          const isPaid = inv.status === "PAID";
          const prescriptions = v.prescriptions || [];

          return (
            <div
              key={v.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#168c9b]">
                      INV-{String(inv.id).padStart(5, "0")}
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(v.visitDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <Badge tone={isPaid ? "emerald" : "amber"}>
                    {isPaid ? "LUNAS" : "BELUM BAYAR"}
                  </Badge>
                </div>

                <div className="mt-4">
                  <p className="font-bold text-[#101a3d] text-[#101a3d]">{v.doctor?.name}</p>
                  <p className="text-xs text-slate-500">{v.poli?.name || "Poli Umum"}</p>
                </div>

                {/* BREAKDOWN BIAYA */}
                <div className="mt-4 rounded-xl bg-slate-50 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Biaya Konsultasi Dokter</span>
                    <span className="font-semibold">{formatRupiah(Number(inv.consultationFee))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Obat-obatan ({prescriptions.length} jenis)</span>
                    <span className="font-semibold">{formatRupiah(Number(inv.medicineTotal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Biaya Administrasi Klinik</span>
                    <span className="font-semibold">{formatRupiah(Number(inv.adminFee))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pajak / PPN</span>
                    <span className="font-semibold">{formatRupiah(Number(inv.tax))}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-[#101a3d]">
                    <span>Total Tagihan</span>
                    <span className="text-[#168c9b]">{formatRupiah(Number(inv.total))}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-5 flex items-center gap-3 pt-3 border-t border-slate-100">
                {!isPaid ? (
                  <button
                    onClick={() => setPayingInvoice(v)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#168c9b] py-2.5 text-xs font-bold text-white shadow hover:bg-[#12727f] transition"
                  >
                    <CreditCard size={16} /> Bayar E-Payment
                  </button>
                ) : (
                  <div className="flex-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={16} /> Pembayaran Selesai
                  </div>
                )}

                <button
                  onClick={() => triggerDownloadPdf(v)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                  title="Unduh Bukti PDF Invoice"
                >
                  <Download size={16} /> PDF
                </button>
              </div>
            </div>
          );
        })}

        {!loading && filteredVisits.length === 0 && (
          <div className="col-span-2 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Receipt className="mx-auto text-slate-400 mb-2" size={32} />
            <h3 className="font-bold text-[#101a3d]">Belum Ada Tagihan</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Tidak ada invoice yang ditemukan sesuai dengan kriteria filter saat ini.
            </p>
          </div>
        )}
      </div>

      {/* E-PAYMENT MODAL */}
      {payingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#101a3d]">Pembayaran Digital E-Payment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Invoice #{payingInvoice.invoice.id} · {payingInvoice.doctor?.name}
            </p>

            <div className="my-4 rounded-xl bg-slate-50 p-4 text-center">
              <span className="text-xs text-slate-500 uppercase font-semibold">Total Tagihan Yang Harus Dibayar</span>
              <p className="text-3xl font-black text-[#168c9b] mt-1">
                {formatRupiah(Number(payingInvoice.invoice.total))}
              </p>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700">Pilih Metode Pembayaran *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-[#101a3d] focus:border-[#168c9b] focus:outline-none"
                >
                  <option value="MIDTRANS">🌟 Midtrans Gateway (QRIS / GoPay / VA Bank / Kartu Kredit)</option>
                  <option value="E_WALLET">E-Wallet Manual (QRIS / OVO)</option>
                  <option value="TRANSFER">Transfer Bank Manual</option>
                  <option value="CASH">Tunai (Bayar di Kasir Klinik)</option>
                </select>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-900 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-[#168c9b]" />
                <span>
                  {paymentMethod === "MIDTRANS"
                    ? "Popup pembayaran Midtrans Snap akan terbuka otomatis setelah klik Konfirmasi. Mendukung QRIS, GoPay, ShopeePay, Virtual Account semua bank, & Kartu Kredit."
                    : "Simulasi pembayaran langsung. Klik konfirmasi untuk menyelesaikan transaksi invoice ini."}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="rounded-xl bg-[#168c9b] px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-[#12727f] transition disabled:opacity-50"
                >
                  {processing ? "Memproses..." : "Konfirmasi Pembayaran Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
