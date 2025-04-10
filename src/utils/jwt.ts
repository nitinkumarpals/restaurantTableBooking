import jwt from "jsonwebtoken";

export const generateToken = (userId: string,email: string) => {
  return jwt.sign({ userId,email }, process.env.JWT_SECRET!, { expiresIn: "1d" });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};