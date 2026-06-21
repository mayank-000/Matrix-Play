import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import Redis from "ioredis"
import { getQuestion, validateAnswer, getLeaderboard } from "../controllers/logic.controller.js"

dotenv.config()

const app = express()
const redis = new Redis({ 
    host: "localhost", 
    port: process.env.REDIS_PORT
})

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(express.json())

// ── GET /api/question ──────────────────────────────────────────────────────────
app.get("/api/question", getQuestion);

// ── POST /api/vote ─────────────────────────────────────────────────────────────
app.post("/api/vote", validateAnswer);

// ── GET /api/leaderboard ───────────────────────────────────────────────────────
app.get("/api/leaderboard", getLeaderboard);

const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))