import { prisma } from "../lib/prisma.js";
export async function getDoctors(_req, res) {
    try {
        let doctors = await prisma.doctor.findMany({
            orderBy: {
                name: "asc",
            },
            include: {
                poli: true,
            },
        });
        if (doctors.length === 0) {
            const polis = await prisma.poli.findMany();
            const umu = polis.find((p) => p.code === "UMU")?.id;
            const obg = polis.find((p) => p.code === "OBG")?.id;
            const ank = polis.find((p) => p.code === "ANK")?.id;
            await prisma.doctor.createMany({
                data: [
                    { name: "Dr. Andi", specialization: "General Practitioner", poliId: umu },
                    { name: "Dr. Budi", specialization: "Obstetrics & Gynecology", poliId: obg },
                    { name: "Dr. Sarah", specialization: "Pediatrics", poliId: ank },
                ],
                skipDuplicates: true,
            });
            doctors = await prisma.doctor.findMany({
                orderBy: { name: "asc" },
                include: { poli: true },
            });
        }
        return res.json({
            success: true,
            data: doctors,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to load doctors",
        });
    }
}
