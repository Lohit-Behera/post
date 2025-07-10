import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// import routes
import authRoute from "./routes/auth.route";
import userRouter from "./routes/user.route";

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRouter);

export { app };
