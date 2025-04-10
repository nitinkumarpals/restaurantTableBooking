import { Request, Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendEmail } from "../utils/emailService";
import { cancelReservationSchema, createReservationSchema } from "../schemas/reservation.schema";

export const reserveTable = async (req: AuthRequest, res: Response) => {
  try {
    const parsedBody = createReservationSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ 
        error: 'Invalid request',
        details: parsedBody.error.message 
      });
      return;
    }

    const { restaurantId, date, time, guests, restaurantName } = parsedBody.data;
    const reservation = await prisma.reservation.create({
      data: { 
        restaurantId,
        userId: (req.user as any).userId,
        date: new Date(date),
        time: time,
        guests
      },
    });
    const userEmail = (req.user as any).email;
    if (!userEmail) {
      res.status(500).json({ 
        error: 'Failed to send email',
        details: 'User email not found' 
      });
      return;
    }
    await sendEmail(
      userEmail,
      'Reservation Confirmation',
      `
        <h2>Reservation Confirmed</h2>
        <p>Your table has been reserved at ${restaurantName}</p>
        <p>Date: ${date}</p>
        <p>Time: ${time}</p>
        <p>Guests: ${guests}</p>
      `
    );

    res.status(201).json({message:"Reservation created successfully",reservation});
    return;
  } catch (error) {
    console.error('Reservation error:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Failed to create reservation',
        details: error.message 
      });
      return;
    }
    res.status(500).json({ 
      error: 'Failed to create reservation',
      details: 'An unexpected error occurred' 
    });
    return;
  }
};

export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const reservations = await prisma.reservation.findMany({ where: { userId } });
    res.json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Failed to fetch reservations',
        details: error.message 
      });
      return;
    }
    res.status(500).json({ 
      error: 'Failed to fetch reservations',
      details: 'An unexpected error occurred' 
    });
    return;
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const parsedParams = cancelReservationSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({ 
        error: 'Invalid request',
        details: parsedParams.error.message 
      });
      return;
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
    return;
  } catch (error) {
    console.error('Cancel reservation error:', error);
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Failed to cancel reservation',
        details: error.message 
      });
      return;
    }
    res.status(500).json({ 
      error: 'Failed to cancel reservation',
      details: 'An unexpected error occurred' 
    });
    return;
  }
};
