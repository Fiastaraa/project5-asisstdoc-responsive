import { prisma } from "../lib/prisma.js";
export async function getDoctors(_req, res) {
    try {
        const doctors = await prisma.doctor.findMany({
            orderBy: {
                name: "asc",
            },
        });
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
