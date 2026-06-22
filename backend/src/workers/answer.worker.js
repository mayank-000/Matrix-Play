import { Worker } from "bullmq";
import pkg from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"

dotenv.config();

const { PrismaClient } = pkg;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const connection = { 
    host: "localhost", 
    port: 6379, 
};

const worker = new Worker("answers", async (job) => {
    const { userId, questionId, optionId, correct } = job.data

    await prisma.answer.create({
        data: { userId, questionId, optionId, correct }
    })

    console.log(`Saved answer for user ${userId}, correct: ${correct}`)
}, { connection })

worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err)
})

worker.on("completed", (job) => {
    console.log(`Job ${job.id} saved to DB`)
})