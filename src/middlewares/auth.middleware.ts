import { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
export interface AuthRequest extends Request {
  user?: string | JwtPayload;
  email?: string; 
}
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    req.email = (decoded as JwtPayload).email || undefined;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
};
