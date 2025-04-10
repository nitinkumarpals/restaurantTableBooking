import { Request, Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { sendEmail } from "../utils/emailService";
import {
  cancelReservationSchema,
  createReservationSchema,
} from "../schemas/reservation.schema";

export const reserveTable = async (req: AuthRequest, res: Response) => {
  try {
    const parsedBody = createReservationSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        error: "Invalid request",
        details: parsedBody.error.message,
      });
      return;
    }

    const { restaurantId, date, time, guests, restaurantName } =
      parsedBody.data;
    const userId = (req.user as any).userId;
    const userEmail = (req.user as any).email;

    // Get restaurant details including capacity
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { capacity: true },
    });

    if (!restaurant) {
      res.status(404).json({ error: "Restaurant not found" });
      return;
    }

    // Check if restaurant has enough capacity
    if (restaurant.capacity < guests) {
      res.status(400).json({
        error: "Insufficient capacity",
        details: `The restaurant can accommodate up to ${restaurant.capacity} guests`,
      });
      return;
    }

    // Check for existing reservations in the same time slot
    const existingReservations = await prisma.reservation.findMany({
      where: {
        restaurantId,
        date: new Date(date),
        time,
      },
      select: { guests: true },
    });

    // Calculate total guests already reserved
    const totalReservedGuests = existingReservations.reduce(
      (sum, reservation) => sum + reservation.guests,
      0
    );

    // Check if adding new reservation would exceed capacity
    if (totalReservedGuests + guests > restaurant.capacity) {
      res.status(400).json({
        error: "Table not available",
        details: `The restaurant is fully booked for this time slot. Current capacity: ${
          restaurant.capacity - totalReservedGuests
        } available`,
      });
      return;
    }

    // Use transaction to ensure data consistency
    const reservation = await prisma.$transaction(async (tx) => {
      // Check again in transaction to prevent race conditions
      const currentReservations = await tx.reservation.findMany({
        where: {
          restaurantId,
          date: new Date(date),
          time,
        },
        select: { guests: true },
      });

      const currentTotal = currentReservations.reduce(
        (sum, reservation) => sum + reservation.guests,
        0
      );

      if (currentTotal + guests > restaurant.capacity) {
        throw new Error("Table not available");
      }

      return tx.reservation.create({
        data: {
          restaurantId,
          userId,
          date: new Date(date),
          time,
          guests,
        },
      });
    });

    if (!userEmail) {
      res.status(500).json({
        error: "Failed to send email",
        details: "User email not found",
      });
      return;
    }
    if (userEmail) {
      sendEmail(
        userEmail,
        "Reservation Confirmation",
        `
          <h2>Reservation Confirmed</h2>
          <p>Your table has been reserved at ${restaurantName}</p>
          <p>Date: ${date}</p>
          <p>Time: ${time}</p>
          <p>Guests: ${guests}</p>
        `
      ).catch(console.error); 
    }

    res.status(201).json({
      message: "Reservation created successfully",
      reservation,
    });
    return;
  } catch (error) {
    console.error("Reservation error:", error);
    if (error instanceof Error) {
      if (error.message === "Table not available") {
        res.status(400).json({
          error: "Table not available",
          details: "The restaurant is fully booked for this time slot",
        });
        return;
      }
    }
    res.status(500).json({
      error: "Failed to create reservation",
      details: "An unexpected error occurred",
    });
    return;
  }
};

export const getUserReservations = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).userId;
    const reservations = await prisma.reservation.findMany({
      where: { userId },
    });
    res.status(200).json(reservations);
    return;
  } catch (error) {
    console.error("Get reservations error:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "Failed to fetch reservations",
        details: error.message,
      });
      return;
    }
    res.status(500).json({
      error: "Failed to fetch reservations",
      details: "An unexpected error occurred",
    });
    return;
  }
};

export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const parsedParams = cancelReservationSchema.safeParse(req.params);
    if (!parsedParams.success) {
      res.status(400).json({
        error: "Invalid request",
        details: parsedParams.error.message,
      });
      return;
    }

    const { id } = parsedParams.data;
    const availableReservation = await prisma.reservation.findUnique({
      where: { id },
    });
    if (!availableReservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    const reservation = await prisma.reservation.delete({ where: { id } });

    if (!reservation) {
      res.status(404).json({ error: "Reservation not found" });
      return;
    }
    if (reservation) {
      const userEmail = (req.user as any).email;
      if (userEmail) {
        sendEmail(
          userEmail,
          "Reservation Cancellation",
          `
            <h2>Reservation Cancelled</h2>
            <p>Your reservation has been cancelled.</p>
          `
        ).catch(console.error);
      }
    }

    res.status(204).send();
    return;
  } catch (error) {
    console.error("Cancel reservation error:", error);
    if (error instanceof Error) {
      res.status(500).json({
        error: "Failed to cancel reservation",
        details: error.message,
      });
      return;
    }
    res.status(500).json({
      error: "Failed to cancel reservation",
      details: "An unexpected error occurred",
    });
    return;
  }
};
