import mongoose, {Schema} from "mongoose";

export type BorrowBook = {
    id: string;
    bookId: mongoose.Types.ObjectId;
    bookTitle: string;
    memberId: mongoose.Types.ObjectId;
    memberEmail: string;
    borrowDate: Date;
    returnDate: Date;
    status: "borrowed" | "returned" | "overdue";
    payStatus: "paid" | "lending";
    payAmount: number;
}

const borrowBookSchema = new mongoose.Schema<BorrowBook>({
    id: {
        type: String
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, "Book ID is required"]
    },
    bookTitle: {
        type: String,
        required: [true, "Book title is required"],
        trim: true
    },
    memberId: {
        type: Schema.Types.ObjectId,
        ref: 'LibraryMemberUser',
        required: [true, "User ID is required"]
    },
    memberEmail: {
        type: String,
        required: [true, "User name is required"],
        trim: true
    },
    borrowDate: {
        type: Date,
        default: Date.now
    },
    returnDate: {
        type: Date,
        required: [true, "Return date is required"]
    },
    status: {
        type: String,
        enum: ["borrowed", "returned", "overdue"],
        default: "borrowed"
    },
    payStatus: {
        type: String,
        enum: ["paid", "lending"],
        default: "lending"
    },
    payAmount: {
        type: Number,
        default: 0
    }
});
export const BorrowBookModel = mongoose.model('BorrowBook', borrowBookSchema);