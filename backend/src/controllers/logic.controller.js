import Redis from "ioredis";
import { generateQuestion } from "../services/llm.service.js";
import { answerQueue } from "../queues/answer.queue.js";

const redis = new Redis({ host: "localhost", port: 6379 });

export const getQuestion = async (req, res) => {
  try {
    const userId = req.userId;

    const progressRaw = await redis.get(`session:${userId}:progress`);
    const progress = progressRaw ? JSON.parse(progressRaw) : { current: 0 };

    if (progress.current >= 50) {
      return res.json({ quotaExhausted: true });
    }
    const generated = await generateQuestion();
    const questionId = `${userId}:${Date.now()}`;

    // Store question + answer + startedAt timestamp together
    // TTL is 2min - just a cleanup buffer, actual timeout is checked via startedAt
    const pipeline = redis.pipeline();
    pipeline.setex(
      `question:${questionId}`,
      120,
      JSON.stringify({
        id: questionId,
        question: generated.question,
        options: generated.options,
        answer: generated.answer,
        startedAt: Date.now(), // TimeStamp when question was sent to user
      }),
    );

    // Updating the Progress Quota
    pipeline.set(
      `session:${userId}:progress`,
      JSON.stringify({ current: progress.current + 1 }),
    );
    // pipeline.exec(): This actually sends the batched commands to the Redis server
    // to be executed all at once.
    await pipeline.exec();

    res.json({
      id: questionId,
      question: generated.question,
      options: generated.options,
      quotaLeft: 50 - (progress.current + 1),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate question" });
  }
};

export const validateAnswer = async (req, res) => {
  try {
    const { questionId, optionId } = await req.body;
    const userId = req.userId;

    const raw = await redis.get(`question:${questionId}`);
    if (!raw) return res.json({ timeout: true });

    const questionData = JSON.parse(raw);

    // Checking is the user answered within 30 sec
    const elapsed = Date.now() - questionData.startedAt;
    if (elapsed > 30000) {
      return res.json({ timeout: true });
    }

    const correct = questionData.answer === optionId;
    const scoreIncrement = correct ? 4 : 1;

    await answerQueue.add("save-answer", {
      userId,
      questionId,
      optionId,
      correct,
    });

    const pipeline = redis.pipeline();
    pipeline.zincrby("leaderboard", scoreIncrement, userId);
    pipeline.del(`question:${questionId}`); // Cleanup - prevent resubmission
    await pipeline.exec();

    res.json({ correct, scoreIncrement });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to submit vote" });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const raw = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");

    const leaderboard = [];
    for (let i = 0; i < raw.length; i += 2) {
      leaderboard.push({
        userId: raw[i],
        username: raw[i],
        score: parseInt(raw[i + 1]),
      });
    }

    res.json(leaderboard);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

export default { getQuestion, validateAnswer, getLeaderboard };
