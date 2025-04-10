import "dotenv/config";
import express from "express";
import type { Request, Response } from "express";
import authRoutes from "./routes/auth.routes";
import restaurantRoutes from "./routes/restaurant.routes";
import reservationRoutes from "./routes/reservation.routes";
import { prisma } from "./config/db";
import rateLimit from "express-rate-limit";
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 4000;
console.log(process.env.PORT);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

const corsOptions = {
  origin: [
    '[https://nitinpaldev.xyz](https://nitinpaldev.xyz)',
    'http://localhost:3000' // for development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(limiter);

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        lastCheck: new Date().toISOString()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: PORT
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Database connection failed'
    });
  }
});

// Routes
app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/reservations", reservationRoutes);


// 404 handler for invalid endpoints
app.use((req: Request, res: Response) => {
  const method = req.method;
  const path = req.path;
  
  // Suggest available endpoints based on the path
  let suggestion: string | null = null;
  if (path.startsWith('/auth')) {
    suggestion = 'Available auth endpoints: /auth/register, /auth/login';
  } else if (path.startsWith('/restaurants')) {
    suggestion = 'Available restaurant endpoints: /restaurants, /restaurants/:id';
  } else if (path.startsWith('/reservations')) {
    suggestion = 'Available reservation endpoints: /reservations, /reservations/:id';
  }

  res.status(404).json({
    error: `Endpoint not found: ${method} ${path}`,
    suggestion: suggestion || 'Please check the API documentation for available endpoints'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
