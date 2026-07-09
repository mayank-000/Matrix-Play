import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyJWT = (req, res, next) => {
    const token = req.cookies?.accesstoken;
    if(!token) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};