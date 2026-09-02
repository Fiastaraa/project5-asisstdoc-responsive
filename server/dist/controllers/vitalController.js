import { z } from "zod";
import { prisma } from "../lib/prisma.js";
const schema = z.object({
    bloodPressure: z.string().min(3).optional(),
    temperature: z.coerce.number().optional(),
    weight: z.coerce.number().optional(),
    height: z.coerce.number().optional(),
    notes: z.string().optional(),
});
export async function updateVitals(req, res) {
    try {
        const id = Number(req.params.id);
        const data = schema.parse(req.body);
        const visit = await prisma.visit.findUnique({ where: { id } });
        if (!visit)
            return res
                .status(404)
                .json({ success: false, message: "Visit not found" });
        const updated = await prisma.visit.update({
            where: { id },
            data: { ...data, status: "IN_CONSULTATION" },
            include: { patient: true, doctor: true },
        });
        res.json({ success: true, message: "Vitals saved", data: updated });
    }
    catch (e) {
        if (e instanceof z.ZodError)
            return res
                .status(400)
                .json({
                success: false,
                message: "Validation failed",
                errors: e.issues,
            });
        console.error(e);
        res.status(500).json({ success: false, message: "Failed to save vitals" });
    }
}
