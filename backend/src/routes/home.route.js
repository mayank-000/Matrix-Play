import express from "express";

import { getQuestion, validateAnswer, getLeaderboard } from "../controllers/logic.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/question", verifyJWT, getQuestion);
router.post("/vote", verifyJWT, validateAnswer);
router.get("/leaderboard", verifyJWT, getLeaderboard);

export default router;