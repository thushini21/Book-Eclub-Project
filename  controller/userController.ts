import { NextFunction, Request, Response } from "express";
import { LibraryMemberUserModel } from "../models/LibraryMemberUser";
import { UserModel } from "../models/User";
import { VerificationCodeGenerator } from "../models/VerificationCodeGenerator";
import { mailSender } from "./mailSender";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.SECRET || "default-secret";

interface VerifyCredentials {
    email: string;
    verificationCode: number;
}

// Add a library member user
export const addUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const libraryUser = new LibraryMemberUserModel(req.body);

        const existingUser = await LibraryMemberUserModel.findOne({
            email: libraryUser.email,
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email",
                status: 400,
            });
        }

        const savedUser = await libraryUser.save();
        return res.status(201).json({
            message: "User added successfully",
            user: savedUser,
            status: 201,
        });
    } catch (error) {
        console.error("Error adding user:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};

// Update library member user
export const updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const email = req.body.email;
        const existingUser = await LibraryMemberUserModel.findOne({ email });

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found with this email",
                status: 404,
            });
        }

        // Fix: await the update call
        const updatedUser = await LibraryMemberUserModel.findByIdAndUpdate(
            existingUser._id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(400).json({
                message: "User not updated",
                status: 400,
            });
        }

        return res.status(200).json({
            message: "User updated successfully",
            user: updatedUser,
            status: 200,
        });
    } catch (e) {
        console.error("Error updating user:", e);
        next(e);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};

// Delete user
export const deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = req.body._id;

        if (!userId) {
            return res.status(400).json({
                message: "User ID is required to delete user",
                status: 400,
            });
        }

        const user = await LibraryMemberUserModel.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: 404,
            });
        }

        return res.status(200).json({
            message: "User deleted successfully",
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};

// Get user by ID (prefer using req.params.id for RESTful APIs)
export const getUser_2 = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = req.params.id || req.body.id;
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                status: 400,
            });
        }

        const user = await LibraryMemberUserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: 404,
            });
        }
        return res.status(200).json({
            user,
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};

// Get all users
export const getAllUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const users = await LibraryMemberUserModel.find();
        return res.status(200).json({
            users,
            status: 200,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};

// Register user (UserModel)
export const userRegister = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { email } = req.body;
        const existUser = await UserModel.findOne({ email });

        if (existUser) {
            return res.status(400).json({
                message: "User already registered with this email",
                status: 400,
            });
        }

        const verificationCode = VerificationCodeGenerator();
        const user = new UserModel({
            ...req.body,
            verificationCode,
        });

        const mailResponse = await mailSender(user);
        if (mailResponse !== 200) {
            return res.status(400).json({
                message: "Failed to send verification email",
                status: 400,
            });
        }

        await user.save();
        return res.status(200).json({
            message: `User registered successfully. Verification code sent to ${user.email}`,
            status: 200,
        });
    } catch (err) {
        console.error("Error in user registration:", err);
        next(err);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};

// Verify user code
export const verifyCode = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { email, verificationCode }: VerifyCredentials = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: 404,
            });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({
                message: "Invalid verification code",
                status: 400,
            });
        }

        user.isVerified = true;
        user.verificationCode = 123456; // Reset or clear code
        await user.save();

        return res.status(200).json({
            message: "User verified successfully",
            status: 200,
        });
    } catch (err) {
        console.error("Error in user verification:", err);
        next(err);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};

// User login
export const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
                status: 401,
            });
        }

        // You should hash passwords in production!
        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid credentials",
                status: 401,
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
                status: 403,
            });
        }

        const token = jwt.sign({ email }, SECRET, { expiresIn: "3h" });
        return res.status(200).json({
            token,
            status: 200,
        });
    } catch (error) {
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};

// Get user by email
export const getUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userEmail: string = req.body.email;
        if (!userEmail) {
            return res.status(400).json({
                message: "Email is required",
                status: 400,
            });
        }

        const user = await UserModel.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: 404,
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            },
            status: 200,
        });
    } catch (error) {
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500,
        });
    }
};
