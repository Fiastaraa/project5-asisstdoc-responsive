import { Request, Response } from "express";
import { z } from "zod";
import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authService.js";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),

  email: z.string().email("Invalid email"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  role: z.enum(["ADMIN", "DOCTOR", "NURSE", "PHARMACIST", "PATIENT"]),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),

  password: z.string().min(1, "Password is required"),
});

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);

    const user = await registerUser(data);

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const message =
      error instanceof Error ? error.message : "Failed to register user";

    if (message === "Email already registered") {
      return res.status(409).json({
        success: false,
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const data = loginSchema.parse(req.body);

    const result = await loginUser(data);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues,
      });
    }

    const message = error instanceof Error ? error.message : "Failed to login";

    if (message === "Invalid email or password") {
      return res.status(401).json({
        success: false,
        message,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.userId;
    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await getCurrentUser(userId);
    return res.json({ success: true, data: { user } });
  } catch {
    return res.status(401).json({ success: false, message: "Session expired" });
  }
}
