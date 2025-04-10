import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
const app = express();
const PORT = process.env.PORT || 4000;
console.log(process.env.PORT);
// Middlewares
app.use(express.json());

// Routes
app.use("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, world!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
