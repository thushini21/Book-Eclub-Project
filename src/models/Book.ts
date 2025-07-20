import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
    title: string;
    author: string;
    isbn: string;
    available: boolean;
}

const BookSchema: Schema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    available: { type: Boolean, default: true }
});

export default mongoose.model<IBook>('Book', BookSchema);
