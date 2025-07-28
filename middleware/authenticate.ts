import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.SECRET || 'your-default-secret';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    console.log("AuthHeader:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: 'Authorization header missing or malformed',
        });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Token is missing',
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET);
        (req as any).user = decoded;
        console.log("✅ Token verified");
        next();
    } catch (err) {
        console.error("❌ Invalid token:", err);
        return res.status(401).json({
            message: 'Unauthorized: Invalid or expired token',
        });
    }
};
