import { z } from "zod";

export const createReservationSchema = z.object({
  restaurantId: z.string(),
  date: z.string(),
  time: z.string(),
  guests: z.number().int().positive(),
  restaurantName: z.string(),
});

export const cancelReservationSchema = z.object({
  id: z.string(),
});

