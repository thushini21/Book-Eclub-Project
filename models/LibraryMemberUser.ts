import mongoose from "mongoose";

export type LibraryMemberUser = {
    name: string;
    email: string;
    contact:string;
    address: string;
}


const userSchema = new mongoose.Schema<LibraryMemberUser>({
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
    contact: { type: String, required: true },
    address: { type: String, required: true }
})

export const LibraryMemberUserModel = mongoose.model('LibraryMemberUser',userSchema)
