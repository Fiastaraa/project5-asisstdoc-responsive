import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import visitRoutes from "./routes/visitRoutes.js";
import diagnosisRoutes from "./routes/diagnosisRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import clinicRoutes from "./routes/clinicRoutes.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.get("/", (_req, res) =>
  res.json({ success: true, message: "AssistDoc API is running" }),
);
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, server: "ok", database: "connected" });
  } catch {
    res
      .status(503)
      .json({ success: false, server: "ok", database: "disconnected" });
  }
});
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/diagnoses", diagnosisRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/invoices", clinicRoutes);
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Endpoint not found" }),
);
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`AssistDoc API running on port ${PORT}`);
});
