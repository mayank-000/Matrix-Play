import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Redis from "ioredis";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const redis = new Redis({
  host: "localhost",
  port: process.env.REDIS_PORT,
});

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

import homeRouter from "./routes/home.route.js";
app.use("/api/home", homeRouter);

import authRouter from "./routes/auth.route.js"
app.use("/api/auth", authRouter);

const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
