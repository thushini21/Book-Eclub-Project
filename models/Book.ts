export type Book ={
    id: string;
    title: string;
    author: string;
    availableCopies: number;
    totalCopies: number;
    description: string;
}
import mongoose from "mongoose";
const bookSchema = new mongoose.Schema<Book>({
    id: {
        type: String
    },
    title: {
        type: String,
        unique: [true, "Book title must be unique"],
        required: [true, "Title is required"],
        trim: true
    },
    author:{
        type: String,
        required: [true, "Author is required"],
        trim: true
    },
    availableCopies: {
        type: Number,
        required: [true, "Available copies are required"],
        min: [0, "Available copies cannot be negative"]
    },
    totalCopies: {
        type: Number,
        required: [true, "Total copies are required"],
        min: [0, "Total copies cannot be negative"]
    },
    description: {
        type: String,
        required: [true, "Description is required"],
        trim: true
    }
});
export const BookModel = mongoose.model('Book', bookSchema);