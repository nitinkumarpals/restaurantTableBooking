import { z } from "zod";

export const createReservationSchema = z.object({
  restaurantId: z.string(),
  date: z.string(),
  time: z.string(),
  guests: z.number().int().positive().min(1, "Guests must be at least 1"),
  restaurantName: z.string(),
});

export const cancelReservationSchema = z.object({
  id: z.string(),
});

