import { z } from "zod";
import { prisma } from "../lib/prisma.js";
const diagnosisSchema = z.object({
    visitId: z.coerce.number().int().positive(),
    diagnosisName: z.string().min(2),
    notes: z.string().optional(),
});
export async function createDiagnosis(req, res) {
    try {
        const data = diagnosisSchema.parse(req.body);
        const visit = await prisma.visit.findUnique({
            where: { id: data.visitId },
        });
        if (!visit) {
            return res.status(404).json({
                success: false,
                message: "Visit not found",
            });
        }
        const diagnosis = await prisma.diagnosis.create({
            data,
        });
        return res.status(201).json({
            success: true,
            message: "Diagnosis saved successfully",
            data: diagnosis,
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
            message: "Failed to save diagnosis",
        });
    }
}
