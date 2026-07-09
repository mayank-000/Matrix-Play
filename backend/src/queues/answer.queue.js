import { Queue } from "bullmq"
import dotenv from "dotenv";
dotenv.config();

const connection = { 
    host: "localhost", 
    port: process.env.REDIS_PORT 
}

export const answerQueue = new Queue("answers", { connection });