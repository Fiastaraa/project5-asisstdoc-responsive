import { prisma } from "../lib/prisma.js";
import { z } from "zod";
const createReminderSchema = z.object({
    patientId: z.coerce.number().int().positive(),
    type: z.enum(["KONTROL", "VAKSINASI", "CEK_LAB"]),
    title: z.string().min(2),
    date: z.string().transform((v) => new Date(v)),
    notes: z.string().optional(),
});
const updateReminderStatusSchema = z.object({
    status: z.enum(["PENDING", "SENT", "COMPLETED"]),
});
export async function getReminders(req, res) {
    try {
        const auth = req.user;
        let where = {};
        if (auth?.role === "PATIENT") {
            const patient = await prisma.patient.findUnique({
                where: { userId: auth.userId },
            });
            if (patient) {
                where.patientId = patient.id;
            }
            else {
                return res.json({ success: true, data: [] });
            }
        }
        const reminders = await prisma.reminder.findMany({
            where,
            orderBy: { date: "asc" },
            include: { patient: true },
        });
        return res.json({ success: true, data: reminders });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to load reminders" });
    }
}
export async function createReminder(req, res) {
    try {
        const data = createReminderSchema.parse(req.body);
        const reminder = await prisma.reminder.create({
            data: {
                patientId: data.patientId,
                type: data.type,
                title: data.title,
                date: data.date,
                notes: data.notes,
                status: "PENDING",
            },
            include: { patient: true },
        });
        return res.status(201).json({ success: true, message: "Reminder created", data: reminder });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        }
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to create reminder" });
    }
}
export async function updateReminderStatus(req, res) {
    try {
        const id = Number(req.params.id);
        const { status } = updateReminderStatusSchema.parse(req.body);
        const reminder = await prisma.reminder.update({
            where: { id },
            data: { status },
        });
        return res.json({ success: true, message: "Reminder status updated", data: reminder });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        }
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to update reminder" });
    }
}
