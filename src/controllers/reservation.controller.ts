import { Request, Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendEmail } from "../utils/emailService";
import { cancelReservationSchema, createReservationSchema } from "../schemas/reservation.schema";

export const reserveTable = async (req: AuthRequest, res: Response) => {
  try {
    const parsedBody = createReservationSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ error: parsedBody.error.message });
    }

    const { restaurantId, date, time, guests, restaurantName } = parsedBody.data;
    
    const reservation = await prisma.reservation.create({
      data: { 
        restaurantId,
        userId: (req.user as any).userId,
        date: new Date(date),
        time,
        guests
      },
    });

    await sendEmail(
      req.email!,
      'Reservation Confirmation',
      `
        <h2>Reservation Confirmed</h2>
        <p>Your table has been reserved at ${restaurantName}</p>
        <p>Date: ${date}</p>
        <p>Time: ${time}</p>
        <p>Guests: ${guests}</p>
      `
    );

    res.status(201).json(reservation);
  } catch (error) {
    console.error('Reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const reservations = await prisma.reservation.findMany({ where: { userId } });
    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const parsedParams = cancelReservationSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({ error: parsedParams.error.message });
    }

    const { id } = parsedParams.data;
    await prisma.reservation.delete({ where: { id } });
    
    await sendEmail(
      (req.user as any).email,
      'Reservation Cancellation',
      `
        <h2>Reservation Cancelled</h2>
        <p>Your reservation has been cancelled.</p>
      `
    );

    res.status(204).send();
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
