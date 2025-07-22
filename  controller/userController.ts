import {NextFunction,Request,Response} from "express";
import {LibraryMemberUserModel} from "../models/LibraryMemberUser";
import {UserModel} from "../models/User";
import {VerificationCodeGenerator} from "../models/VerificationCodeGenerator";
import {mailSender} from "./mailSender";
import jwt from "jsonwebtoken";



const JWT_SECRET  =  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphZ2F0aGFudXJhNjMyQGdtYWlsLmNvbSIsImlkIjoiNjg3ZjI2ZWMwMjU4MjUzNmEyZTY2MjAyIiwiaWF0IjoxNzUzMTY0NDY5LCJleHAiOjE3NTMxNzUyNjl9.ViD2fEebkOxH1Gl9vgRSyRQVVIK1b4jv9Ezx8a3tufw ";
interface VerifyCredentials {
    email: string;
    verificationCode: number;
}
export const addUser = async (req:Request, res:Response,next:NextFunction):Promise<any> => {
    const libraryUser = new LibraryMemberUserModel(req.body);
    const id = req.body._id;
    libraryUser.id = id;


    console.log("library User",libraryUser);
    const existingUser = await LibraryMemberUserModel.findOne({ email: libraryUser.email });
    if (existingUser) {
        return res.status(400).json({
            message: "User already exists with this email",
            status: 400
        });
    }

    try {
        const savedUser = await libraryUser.save();
        return res.status(201).json({
            message: "User added successfully",
            user: savedUser,
            status: 201
        });
    } catch (error) {
        console.error("Error adding user:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
}
export const updateUser = async (req:Request, res:Response,next:NextFunction):Promise<any> => {
  console.log("Update user...............................................................................................................")

   try{
       console.log("Update user",req.body)
       const email = req.body.email;
       const existingUser = await LibraryMemberUserModel.findOne({email})
       if (!existingUser) {
           return res.status(400).json({
               message: "User not found with this email",
               status: 400
           })
       }
       const updateUser =  LibraryMemberUserModel.findByIdAndUpdate({
           _id: existingUser._id
       }, req.body, { new: true, runValidators: true })
       if(!updateUser){
           return res.status(400).json({
               message: "User not updated",
               status: 400
           })
       }
      if(await updateUser){
          return res.status(201).json({
              message: "User updated successfully",
              status: 201
          })
      }

   }catch (e) {
         console.error("Error updating user:", e);
         next(e);
         return res.status(500).json({
              message: "Internal server error",
              status: 500
         });

   }
}
export const deleteUser = async (req:Request, res:Response,next:NextFunction):Promise<any> => {
   console.log("Delete user...............................................................................................................",req.body)
    const userId = req.body._id;
    try {
        const user = await LibraryMemberUserModel.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: 404
            });
        }
        return res.status(200).json({
            message: "User deleted successfully",
            status: 200
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
}
export const getUser_2 = async (req:Request, res:Response,next:NextFunction):Promise<any> => {
    const userId = req.body.id;
    try {
        const user = await LibraryMemberUserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: 404
            });
        }
        return res.status(200).json({
            user,
            status: 200
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
}
export const getAllUser = async (req:Request, res:Response,next:NextFunction):Promise<any> => {
    try {
        const users = await LibraryMemberUserModel.find();
        return res.status(200).json({
            message :users,
            status: 200
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
}



export const userRegister = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email } = req.body;
        const existUser = await UserModel.findOne({ email });

        if (existUser) {
            return res.status(400).json({
                message: "User already registered with this email",
                status: 400
            });
        }

        const verificationCode = VerificationCodeGenerator();
        const user = new UserModel({
            ...req.body,
            verificationCode
        });

        const mailResponse = await mailSender(user);
        if (mailResponse !== 200) {
            return res.status(400).json({
                message: "Failed to send verification email",
                status: 400
            });
        }

        const newUser = await user.save();
        return res.status(200).json({
            message: `User registered successfully. Verification code sent to ${user.email}`,
            status: 200
        });

    } catch (err) {
        console.error("Error in user registration:", err);
        next(err);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
};

export const verifyCode = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email, verificationCode }: VerifyCredentials = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: 404
            });
        }

        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({
                message: "Invalid verification code",
                status: 400
            });
        }

        user.isVerified = true;
        user.verificationCode = 123456; // Reset to default
        await user.save();

        return res.status(200).json({
            message: "User verified successfully",
            status: 200
        });

    } catch (err) {
        console.error("Error in user verification:", err);
        next(err);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
};

// export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
//     try {
//         const { email, password } = req.body;
//         const user = await UserModel.findOne({ email });
//
//         if (!user) {
//             return res.status(404).json({
//                 message: "Invalid credentials",
//                 status: 404
//             });
//         }
//
//         if (user.password !== password) {
//             return res.status(401).json({
//                 message: "Invalid credentials",
//                 status: 401
//             });
//         }
//
//         if (!user.isVerified) {
//             return res.status(403).json({
//                 message: "Please verify your email first",
//                 status: 403
//             });
//         }
//
//         const token = jwt.sign(
//             {
//                 email: user.email,
//                 id: user._id
//             },
//             process.env.JWT_SECRET || "fallbackSecret",
//             { expiresIn: "3h" }
//         );
//
//         return res.status(200).json({
//             message: "Login successful",
//             token,
//             user: {
//                 id: user._id,
//                 email: user.email,
//                 name: user.name
//             },
//             status: 200
//         });
//
//     } catch (error) {
//         console.error("Login Error:", error); // Optional: for debugging
//         return res.status(500).json({
//             message: "Internal server error",
//             status: 500
//         });
//     }
// };

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "Invalid credentials",
                status: 404
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Invalid credentials",
                status: 401
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
                status: 403
            });
        }

        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "3h" });
        return res.status(200).json({
            token,
            status: 200
        });

    } catch (error) {
        next(error);
        return res.status(500).json({
            message: "Internal server error",
            status: 500
        });
    }
};
export const getUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    const userEmail:string = req.body.email;

    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
        return res.status(404).json({
            message: "User not found",
            status: 404
        });
    }
    return res.status(200).json({
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        },
        status: 200
    });

}
