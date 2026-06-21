import { Worker } from "bullmq";
// import { PrismaClient } from "../generated/prisma/index.js"

// const prisma = new PrismaClient()
const connection = { 
    host: "localhost", 
    port: 6379, 
};

const worker = new Worker("answers", async (job) => {
    const { userId, questionId, optionId, correct } = job.data

    // await prisma.answer.create({
    //     data: { userId, questionId, optionId, correct }
    // })

    console.log(`Saved answer for user ${userId}, correct: ${correct}`)
}, { connection })

worker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed:`, err)
})