import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import restaurantRoutes from "./routes/restaurant.routes";
import reservationRoutes from "./routes/reservation.routes";
const app = express();
const PORT = process.env.PORT || 4000;
console.log(process.env.PORT);
// Middlewares
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/reservations", reservationRoutes);

// Root route (should be last)
app.use("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, world!" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
