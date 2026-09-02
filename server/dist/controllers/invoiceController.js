import { prisma } from "../lib/prisma.js";
const consultationFee = Number(process.env.CONSULTATION_FEE ?? 30000);
const adminFee = Number(process.env.ADMIN_FEE ?? 5000);
const taxRate = Number(process.env.TAX_RATE ?? 0.18);
export async function createInvoice(req, res) {
    try {
        const visitId = Number(req.body.visitId);
        if (!visitId) {
            return res.status(400).json({
                success: false,
                message: "visitId is required",
            });
        }
        const visit = await prisma.visit.findUnique({
            where: {
                id: visitId,
            },
            include: {
                prescriptions: {
                    include: {
                        medicine: true,
                    },
                },
                invoice: true,
            },
        });
        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found",
            });
        }
        if (visit.invoice) {
            return res.status(409).json({
                success: false,
                message: "Invoice already exists",
                data: visit.invoice,
            });
        }
        const medicineTotal = visit.prescriptions.reduce((total, item) => total + Number(item.medicine.price) * item.quantity, 0);
        const subtotal = consultationFee + medicineTotal + adminFee;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        const invoice = await prisma.invoice.create({
            data: {
                visitId,
                consultationFee,
                medicineTotal,
                adminFee,
                tax,
                subtotal,
                total,
                status: "UNPAID",
            },
            include: {
                visit: {
                    include: {
                        patient: true,
                        doctor: true,
                    },
                },
                payments: true,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Invoice generated successfully",
            data: invoice,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate invoice",
        });
    }
}
export async function getInvoiceById(req, res) {
    try {
        const id = Number(req.params.id);
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                visit: {
                    include: {
                        patient: true,
                        doctor: true,
                        diagnoses: true,
                        prescriptions: {
                            include: {
                                medicine: true,
                            },
                        },
                    },
                },
                payments: true,
            },
        });
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }
        return res.json({
            success: true,
            data: invoice,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to load invoice",
        });
    }
}
export async function payInvoice(req, res) {
    try {
        const id = Number(req.params.id);
        const method = req.body.method;
        if (!["CASH", "TRANSFER", "E_WALLET"].includes(method)) {
            return res.status(400).json({
                success: false,
                message: "Payment method must be CASH, TRANSFER, or E_WALLET",
            });
        }
        const invoice = await prisma.invoice.findUnique({
            where: { id },
        });
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Invoice not found",
            });
        }
        if (invoice.status === "PAID") {
            return res.status(400).json({
                success: false,
                message: "Invoice is already paid",
            });
        }
        const result = await prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    invoiceId: id,
                    method,
                },
            });
            const updatedInvoice = await tx.invoice.update({
                where: { id },
                data: {
                    status: "PAID",
                },
                include: {
                    payments: true,
                    visit: true,
                },
            });
            await tx.visit.update({
                where: {
                    id: invoice.visitId,
                },
                data: {
                    status: "PAID",
                },
            });
            return {
                payment,
                invoice: updatedInvoice,
            };
        });
        return res.json({
            success: true,
            message: "Payment completed successfully",
            data: result,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to process payment",
        });
    }
}
