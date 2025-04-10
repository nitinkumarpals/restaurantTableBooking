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
       res.status(400).json({ 
        error: 'Invalid registration data',
        details: parsedBody.error.message 
      });
      return;
    }

    const { email, password, name } = parsedBody.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ 
        error: 'User already exists',
        details: 'Email is already registered' 
      });
      return;
    }
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
    res.status(201).json({ message: 'Registration successful', token: generateToken(user.id,user.email) });
    return;
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Registration failed',
        details: error.message 
      });
      return;
    }
    res.status(500).json({ 
      error: 'Registration failed',
      details: 'An unexpected error occurred' 
    });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsedBody = loginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ 
        error: 'Invalid credentials',
        details: parsedBody.error.message 
      });
      return;
    }

    const { email, password } = parsedBody.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ 
        error: 'Authentication failed',
        details: 'Invalid email or password' 
      });
      return;
    }
    res.status(200).json({ message: 'Login successful', token: generateToken(user.id,user.email) });
    return;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Login failed',
        details: error.message 
      });
      return;
    }
    res.status(500).json({ 
      error: 'Login failed',
      details: 'An unexpected error occurred' 
    });
    return;
  }
};
