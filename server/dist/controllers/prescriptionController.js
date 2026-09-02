import { z } from "zod";
import { prisma } from "../lib/prisma.js";
const createPrescriptionSchema = z.object({
    visitId: z.coerce.number().int().positive(),
    medicineId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive(),
});
const statusSchema = z.object({
    status: z.enum(["PENDING", "READY"]),
});
export async function createPrescription(req, res) {
    try {
        const data = createPrescriptionSchema.parse(req.body);
        const medicine = await prisma.medicine.findUnique({
            where: {
                id: data.medicineId,
            },
        });
        if (!medicine) {
            return res.status(404).json({
                success: false,
                message: "Medicine not found",
            });
        }
        if (medicine.stock < data.quantity) {
            return res.status(400).json({
                success: false,
                message: "Insufficient medicine stock",
            });
        }
        const visit = await prisma.visit.findUnique({
            where: {
                id: data.visitId,
            },
        });
        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found",
            });
        }
        const prescription = await prisma.prescription.create({
            data: {
                visitId: data.visitId,
                medicineId: data.medicineId,
                quantity: data.quantity,
            },
            include: {
                medicine: true,
                visit: true,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Prescription created successfully",
            data: prescription,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues,
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create prescription",
        });
    }
}
export async function updatePrescriptionStatus(req, res) {
    try {
        const id = Number(req.params.id);
        const { status } = statusSchema.parse(req.body);
        const prescription = await prisma.prescription.findUnique({
            where: { id },
            include: {
                medicine: true,
                visit: {
                    include: {
                        prescriptions: true,
                    },
                },
            },
        });
        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: "Prescription not found",
            });
        }
        if (status === "READY" && prescription.status !== "READY") {
            if (prescription.medicine.stock < prescription.quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient medicine stock",
                });
            }
            const updated = await prisma.$transaction(async (tx) => {
                const result = await tx.prescription.update({
                    where: { id },
                    data: { status },
                    include: {
                        medicine: true,
                        visit: true,
                    },
                });
                await tx.medicine.update({
                    where: {
                        id: prescription.medicineId,
                    },
                    data: {
                        stock: {
                            decrement: prescription.quantity,
                        },
                    },
                });
                return result;
            });
            const pending = await prisma.prescription.count({
                where: { visitId: prescription.visitId, status: "PENDING" },
            });
            let invoice = null;
            if (pending === 0) {
                const fullVisit = await prisma.visit.findUnique({
                    where: { id: prescription.visitId },
                    include: {
                        prescriptions: { include: { medicine: true } },
                        invoice: true,
                    },
                });
                if (fullVisit && !fullVisit.invoice) {
                    const consultationFee = Number(process.env.CONSULTATION_FEE ?? 30000);
                    const adminFee = Number(process.env.ADMIN_FEE ?? 5000);
                    const taxRate = Number(process.env.TAX_RATE ?? 0.18);
                    const medicineTotal = fullVisit.prescriptions.reduce((sum, item) => sum + Number(item.medicine.price) * item.quantity, 0);
                    const subtotal = consultationFee + adminFee + medicineTotal;
                    const tax = subtotal * taxRate;
                    invoice = await prisma.invoice.create({
                        data: {
                            visitId: prescription.visitId,
                            consultationFee,
                            medicineTotal,
                            adminFee,
                            tax,
                            subtotal,
                            total: subtotal + tax,
                            status: "UNPAID",
                        },
                    });
                }
            }
            return res.json({
                success: true,
                message: invoice
                    ? "Medicine ready and invoice generated"
                    : "Medicine marked as ready",
                data: updated,
                invoice,
            });
        }
        const updated = await prisma.prescription.update({
            where: { id },
            data: { status },
            include: {
                medicine: true,
                visit: true,
            },
        });
        return res.json({
            success: true,
            message: "Prescription status updated",
            data: updated,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues,
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update prescription",
        });
    }
}
