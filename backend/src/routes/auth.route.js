import express from "express";

import { createUserAccount, loginUser, getMe } from "../controllers/auth.controller.js";
import { verifyJWT } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post('/signup', createUserAccount);
router.post('/signin', loginUser);
router.get('/me', verifyJWT, getMe);

export default router;