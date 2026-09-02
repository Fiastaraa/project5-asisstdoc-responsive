import api from "./api";
export const clinic = {
  patients: async (q = "") =>
    (await api.get(`/patients${q ? `?search=${encodeURIComponent(q)}` : ""}`))
      .data,
  createPatient: async (data: any) => (await api.post("/patients", data)).data,
  doctors: async () => (await api.get("/doctors")).data,
  visits: async (date = "today") =>
    (await api.get(`/visits?date=${date}`)).data,
  visit: async (id: number) => (await api.get(`/visits/${id}`)).data,
  createVisit: async (data: any) => (await api.post("/visits", data)).data,
  status: async (id: number, status: string) =>
    (await api.patch(`/visits/${id}/status`, { status })).data,
  vitals: async (id: number, data: any) =>
    (await api.patch(`/visits/${id}/vitals`, data)).data,
  diagnosis: async (data: any) => (await api.post("/diagnoses", data)).data,
  medicines: async (search = "") =>
    (await api.get(`/medicines${search ? `?search=${encodeURIComponent(search)}` : ""}`)).data,
  createMedicine: async (data: any) =>
    (await api.post("/medicines", data)).data,
  updateMedicine: async (id: number, data: any) =>
    (await api.patch(`/medicines/${id}`, data)).data,
  adjustMedicineStock: async (id: number, adjustment: number) =>
    (await api.patch(`/medicines/${id}/stock`, { adjustment })).data,
  deleteMedicine: async (id: number) =>
    (await api.delete(`/medicines/${id}`)).data,
  prescription: async (data: any) =>
    (await api.post("/prescriptions", data)).data,
  prescriptionStatus: async (id: number, status: string) =>
    (await api.patch(`/prescriptions/${id}/status`, { status })).data,
  invoice: async (id: number) => (await api.get(`/invoices/${id}`)).data,
  createInvoice: async (visitId: number) =>
    (await api.post("/invoices", { visitId })).data,
  pay: async (id: number, method: string) =>
    (await api.patch(`/invoices/${id}/pay`, { method })).data,
  reports: async (range = "weekly") =>
    (await api.get(`/invoices/reports?range=${range}`)).data,
  users: async () => (await api.get("/users")).data,
  payInvoice: async (id: number, method = "CASH") =>
    (await api.patch(`/invoices/${id}/pay`, { method })).data,
  polis: async () => (await api.get("/polis")).data,
  createPoli: async (data: any) => (await api.post("/polis", data)).data,
  reminders: async () => (await api.get("/reminders")).data,
  createReminder: async (data: any) => (await api.post("/reminders", data)).data,
  updateReminderStatus: async (id: number, status: string) =>
    (await api.patch(`/reminders/${id}`, { status })).data,
};
export function unwrap<T = any>(response: any): T {
  return response?.data ?? response;
}
