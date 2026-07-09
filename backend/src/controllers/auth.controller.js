import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "10d" });
};

export const createUserAccount = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Email and Password must be required",
    });
  }
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least of 6 characters",
    });
  }
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hashing of password--
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user in database--
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });
    res
      .status(201)
      .json({ message: "User created successfully", userId: user.id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while creating user", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id);

    return res
      .status(200)
      .cookie("accesstoken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login Successful",
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error while Login", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true },
    });
    if(!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
}
