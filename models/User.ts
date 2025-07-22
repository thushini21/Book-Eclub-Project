import mongoose from "mongoose";

export type User = {
    id: string;
    name: string;
    email: string;
    password: string;
    verificationCode:number;
    isVerified: boolean;
    mailSend:boolean;
}


const userSchema = new mongoose.Schema<User>({
    id:{
        type:String
    },
    name: {
        type: String,
        minlength: [2, "Name at least 2 characters"],
        required: [true, "Name is required"],
        trim:true
    },
    email: { type: String,
        unique:[true,"User already registered"],
        required:[true,"email is required"],
        lowercase: true,
        match:[/^\S+@\S+\.\S+$/,"please fill a valid email format"]

    },
    password: { type: String, required: true },

    verificationCode: {
        type: Number,
        required: [true, "Verification code is required"]

    },
    isVerified: {
        type: Boolean,
        default: false
    },
    mailSend:{
        type:Boolean,
        default: false
    }
})

export const UserModel = mongoose.model('User',userSchema)
