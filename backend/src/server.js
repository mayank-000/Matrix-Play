import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Redis from "ioredis";

dotenv.config();

const app = express();
const redis = new Redis({
  host: "localhost",
  port: process.env.REDIS_PORT,
});

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

import homeRouter from "./routes/home.route.js";
app.get("/api", homeRouter);

const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
