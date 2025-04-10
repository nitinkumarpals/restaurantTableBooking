import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/db";
import { generateToken } from "../utils/jwt";
import { loginSchema, registerSchema } from "../schemas/auth.schema";

export const register = async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parsedBody = registerSchema.safeParse(body);
    if (!parsedBody.success) {
      res.status(400).json({ error: parsedBody.error.message });
      return;
    }

    const { email, password, name } = parsedBody.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.status(201).json({ token: generateToken(user.id) });
    return;
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsedBody = loginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: parsedBody.error.message });
      return;
    }

    const { email, password } = parsedBody.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    res.status(200).json({ token: generateToken(user.id) });
    return;
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
