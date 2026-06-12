import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "ioredis"
import { generateQuestion } from "./src/services/llm.service.js"
import { answerQueue } from "./src/queues/answer.queue.js"

dotenv.config()

const app = express()
const redis = new createClient({ host: "localhost", port: 6379 })

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))
app.use(express.json())

// GET /api/question
app.get("/api/question", async (req, res) => {
    try {
        const userId = req.user.id  // comes from JWT middleware, add that later

        // check progress
        const progressRaw = await redis.get(`session:${userId}:progress`)
        const progress = progressRaw ? JSON.parse(progressRaw) : { current: 0 }

        if (progress.current >= 5) {
            return res.json({ gameOver: true })
        }

        // generate question from LLM
        const generated = await generateQuestion()
        const questionId = `${userId}:${Date.now()}`

        // store question (without answer) in Redis — 10 min TTL
        await redis.setex(
            `question:${questionId}`,
            600,
            JSON.stringify({
                id: questionId,
                question: generated.question,
                options: generated.options
            })
        )

        // store answer separately in Redis — 10 min TTL
        await redis.setex(`question:${questionId}:answer`, 600, generated.answer)

        // store user session timer — 30 sec TTL
        await redis.setex(`session:${userId}:current`, 30, questionId)

        // update progress
        await redis.set(
            `session:${userId}:progress`,
            JSON.stringify({ current: progress.current + 1 })
        )

        res.json({
            id: questionId,
            question: generated.question,
            options: generated.options
        })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to generate question" })
    }
})

// POST /api/vote
app.post("/api/vote", async (req, res) => {
    try {
        const { questionId, optionId } = req.body
        const userId = req.user.id

        // check if user still has time
        const session = await redis.get(`session:${userId}:current`)
        if (!session) {
            return res.json({ timeout: true })
        }

        // get correct answer from Redis
        const correctAnswer = await redis.get(`question:${questionId}:answer`)
        const correct = parseInt(correctAnswer) === optionId

        // push to queue → worker saves to DB
        await answerQueue.add("save-answer", {
            userId,
            questionId,
            optionId,
            correct
        })

        // delete session timer so user can't answer again
        await redis.del(`session:${userId}:current`)

        res.json({ correct })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: "Failed to submit vote" })
    }
})

app.listen(3000, () => console.log("Server running on port 3000"))