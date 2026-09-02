import { prisma } from "../lib/prisma.js";
import { z } from "zod";
const poliSchema = z.object({
    name: z.string().min(2),
    code: z.string().min(2).max(10).toUpperCase(),
});
export async function getPolis(_req, res) {
    try {
        if (!prisma.poli) {
            const defaultPolis = [
                { id: 1, name: "Poli Umum", code: "UMU" },
                { id: 2, name: "Poli Obgyn", code: "OBG" },
                { id: 3, name: "Poli Anak", code: "ANK" },
                { id: 4, name: "Poli Gigi", code: "GIG" },
            ];
            return res.json({ success: true, data: defaultPolis });
        }
        let polis = await prisma.poli.findMany({
            orderBy: { name: "asc" },
            include: {
                doctors: true,
            },
        });
        if (!polis || polis.length === 0) {
            const defaultPolis = [
                { name: "Poli Umum", code: "UMU" },
                { name: "Poli Obgyn", code: "OBG" },
                { name: "Poli Anak", code: "ANK" },
                { name: "Poli Gigi", code: "GIG" },
            ];
            for (const p of defaultPolis) {
                await prisma.poli.upsert({
                    where: { code: p.code },
                    update: p,
                    create: p,
                });
            }
            polis = await prisma.poli.findMany({
                orderBy: { name: "asc" },
                include: { doctors: true },
            });
        }
        return res.json({ success: true, data: polis });
    }
    catch (error) {
        console.error(error);
        const defaultPolis = [
            { id: 1, name: "Poli Umum", code: "UMU" },
            { id: 2, name: "Poli Obgyn", code: "OBG" },
            { id: 3, name: "Poli Anak", code: "ANK" },
            { id: 4, name: "Poli Gigi", code: "GIG" },
        ];
        return res.json({ success: true, data: defaultPolis });
    }
}
export async function createPoli(req, res) {
    try {
        const data = poliSchema.parse(req.body);
        const poli = await prisma.poli.create({ data });
        return res.status(201).json({ success: true, message: "Poli created", data: poli });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: "Validation error", errors: error.issues });
        }
        console.error(error);
        return res.status(500).json({ success: false, message: "Failed to create poli" });
    }
}
