import { prisma } from "../lib/prisma.js";
import { z } from "zod";
const patientSchema = z.object({
    name: z.string().min(2),
    nik: z.string().optional(),
    birthDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
    gender: z.string().min(1),
    age: z.coerce.number().int().min(0).max(150),
    phone: z.string().min(5),
    address: z.string().min(3),
});
export async function getPatients(req, res) {
    try {
        const search = String(req.query.search ?? "").trim();
        const patients = await prisma.patient.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { phone: { contains: search } },
                        { nik: { contains: search } },
                    ],
                }
                : undefined,
            orderBy: { createdAt: "desc" },
        });
        return res.json({ success: true, data: patients });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to load patients" });
    }
}
export async function createPatient(req, res) {
    try {
        const data = patientSchema.parse(req.body);
        const patient = await prisma.patient.create({
            data,
        });
        return res.status(201).json({
            success: true,
            message: "Patient created successfully",
            data: patient,
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
            message: "Failed to create patient",
        });
    }
}
export async function getMyPatient(req, res) {
    try {
        const userId = req.user?.userId;
        let patient = await prisma.patient.findUnique({ where: { userId } });
        if (!patient && userId) {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (user) {
                patient = await prisma.patient.create({
                    data: {
                        name: user.name,
                        gender: "Female",
                        age: 25,
                        phone: "0812" + Math.floor(10000000 + Math.random() * 90000000),
                        address: "Alamat Pasien Terdaftar",
                        userId: user.id,
                    },
                });
            }
        }
        if (!patient) {
            return res
                .status(404)
                .json({
                success: false,
                message: "Patient profile not linked to this account",
            });
        }
        return res.json({ success: true, data: patient });
    }
    catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ success: false, message: "Failed to load patient profile" });
    }
}
