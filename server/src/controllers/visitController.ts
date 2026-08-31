import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const createVisitSchema = z.object({
  patientId: z.coerce.number().int().positive(),
  doctorId: z.coerce.number().int().positive(),
  poliId: z.coerce.number().int().positive().optional(),
  complaint: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(["WAITING", "CALLED", "IN_CONSULTATION", "COMPLETED", "PAID"]),
});

export async function getVisits(req: Request, res: Response) {
  try {
    const date = String(req.query.date ?? "today");
    const auth = (req as any).user as
      { userId: number; role: string } | undefined;

    let where: any = {};

    if (date === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      where = {
        visitDate: {
          gte: start,
          lte: end,
        },
      };
    }

    if (auth?.role === "PATIENT") {
      where.patient = { userId: auth.userId };
    }
    if (auth?.role === "DOCTOR") {
      where.doctor = { userId: auth.userId };
    }

    const visits = await prisma.visit.findMany({
      where,
      orderBy: {
        visitDate: "asc",
      },
      include: {
        patient: true,
        doctor: true,
        poli: true,
        diagnoses: true,
        prescriptions: {
          include: {
            medicine: true,
          },
        },
        invoice: true,
      },
    });

    return res.json({
      success: true,
      data: visits,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load visits",
    });
  }
}

export async function getVisitById(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);

    const visit = await prisma.visit.findUnique({
      where: {
        id,
      },
      include: {
        patient: true,
        doctor: true,
        poli: true,
        diagnoses: true,
        prescriptions: {
          include: {
            medicine: true,
          },
        },
        invoice: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    const auth = (req as any).user as
      { userId: number; role: string } | undefined;
    if (auth?.role === "PATIENT") {
      const owner = await prisma.patient.findUnique({
        where: { id: visit.patientId },
        select: { userId: true },
      });
      if (owner?.userId && owner.userId !== auth.userId)
        return res.status(403).json({ success: false, message: "Forbidden" });
    }
    if (auth?.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { id: visit.doctorId },
        select: { userId: true },
      });
      if (doctor?.userId && doctor.userId !== auth.userId)
        return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({
      success: true,
      data: visit,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load visit",
    });
  }
}

export async function createVisit(req: Request, res: Response) {
  try {
    const data = createVisitSchema.parse(req.body);

    const [patient, doctor] = await Promise.all([
      prisma.patient.findUnique({
        where: {
          id: data.patientId,
        },
      }),
      prisma.doctor.findUnique({
        where: {
          id: data.doctorId,
        },
        include: { poli: true },
      }),
    ]);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayCount = await prisma.visit.count({
      where: { visitDate: { gte: start, lte: end } },
    });

    const poliCode = doctor.poli?.code || "A";
    const queueNumber = `${poliCode}${String(todayCount + 1).padStart(3, "0")}`;
    const estimatedWaitMinutes = (todayCount + 1) * 15;
    const poliId = data.poliId || doctor.poliId || undefined;

    const visit = await prisma.visit.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        poliId,
        queueNumber,
        estimatedWaitMinutes,
        complaint: data.complaint,
        status: "WAITING",
      },
      include: {
        patient: true,
        doctor: true,
        poli: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Visit registered successfully",
      data: visit,
    });
  } catch (error) {
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
      message: "Failed to create visit",
    });
  }
}

export async function updateVisitStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { status } = statusSchema.parse(req.body);

    const auth = (req as any).user as
      | {
          userId: number;
          role: "ADMIN" | "DOCTOR" | "NURSE" | "PHARMACIST" | "PATIENT";
        }
      | undefined;

    const visit = await prisma.visit.findUnique({
      where: { id },
    });

    if (!visit) {
      return res.status(404).json({
        success: false,
        message: "Visit not found",
      });
    }

    if (
      auth?.role === "DOCTOR" &&
      (visit.status !== "IN_CONSULTATION" || status !== "COMPLETED")
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Doctor can only complete a visit that is ready for consultation.",
      });
    }

    const updatedVisit = await prisma.visit.update({
      where: { id },
      data: { status },
      include: { patient: true, doctor: true },
    });

    let invoice = null;
    if (status === "COMPLETED") {
      const fullVisit = await prisma.visit.findUnique({
        where: { id },
        include: {
          prescriptions: { include: { medicine: true } },
          invoice: true,
        },
      });
      const pending = fullVisit?.prescriptions.some(
        (item) => item.status === "PENDING",
      );
      if (fullVisit && !pending && !fullVisit.invoice) {
        const consultationFee = Number(process.env.CONSULTATION_FEE ?? 30000);
        const adminFee = Number(process.env.ADMIN_FEE ?? 5000);
        const taxRate = Number(process.env.TAX_RATE ?? 0.18);
        const medicineTotal = fullVisit.prescriptions.reduce(
          (sum, item) => sum + Number(item.medicine.price) * item.quantity,
          0,
        );
        const subtotal = consultationFee + adminFee + medicineTotal;
        const tax = subtotal * taxRate;
        invoice = await prisma.invoice.create({
          data: {
            visitId: id,
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
      message: "Visit status updated",
      data: updatedVisit,
      invoice,
    });
  } catch (error) {
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
      message: "Failed to update visit status",
    });
  }
}
