import express from "express";

import { getQuestion, validateAnswer, getLeaderboard } from "../controllers/logic.controller.js";

const router = express.Router();

router.get("/question", getQuestion);
router.post("/vote", validateAnswer);
router.get("/leaderboard", getLeaderboard);

export default router;