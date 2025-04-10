import { Router } from "express";
import {
  cancelReservation,
  getUserReservations,
  reserveTable,
} from "../controllers/reservation.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
router.use(authMiddleware);
router.post("/", reserveTable);
router.get("/", getUserReservations);
router.delete("/:id", cancelReservation);
export default router;
