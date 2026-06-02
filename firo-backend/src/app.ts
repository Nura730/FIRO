import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";


import authRoutes from "./modules/auth/auth.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import roomRoutes from "./modules/room/room.route";
import expenseRoutes from "./modules/expense/expense.route";
import settlementRoutes from "./modules/settlement/settlement.route";
import dashboardRoutes from "./modules/dashboard/dashboard.route";

const app: Application = express();

/*
|--------------------------------------------------------------------------
| Global Middlewares
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

/*
|--------------------------------------------------------------------------
| Health Check Route
|--------------------------------------------------------------------------
*/

app.get("/api/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "FIRO Backend Running",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use(
  "/api/expenses",
  expenseRoutes
);
app.use(
  "/api/settlements",
  settlementRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(errorMiddleware);

export default app;