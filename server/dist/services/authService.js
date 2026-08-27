import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
}
export async function registerUser(input) {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });
    if (existingUser) {
        throw new Error("Email already registered");
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: input.role,
        },
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}
export async function loginUser(input) {
    const user = await prisma.user.findUnique({
        where: {
            email: input.email,
        },
    });
    if (!user) {
        throw new Error("Invalid email or password");
    }
    const passwordMatch = await bcrypt.compare(input.password, user.password);
    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }
    const token = jwt.sign({
        userId: user.id,
        role: user.role,
    }, JWT_SECRET, {
        expiresIn: "1d",
    });
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
}
export async function getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
    });
    if (!user)
        throw new Error("User not found");
    return user;
}
