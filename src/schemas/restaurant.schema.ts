import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string(),
  location: z.string().min(1, 'Location is required'),
  cuisine: z.string().min(1, 'Cuisine is required'),
  capacity: z.number().int().positive(),
});
