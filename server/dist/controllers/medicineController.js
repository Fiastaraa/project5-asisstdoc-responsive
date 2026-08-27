import { prisma } from "../lib/prisma.js";
export async function getMedicines(req, res) {
    try {
        const search = String(req.query.search ?? "").trim();
        const medicines = await prisma.medicine.findMany({
            where: search
                ? {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                }
                : undefined,
            orderBy: {
                name: "asc",
            },
        });
        return res.json({
            success: true,
            data: medicines,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to load medicines",
        });
    }
}
