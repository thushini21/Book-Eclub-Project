import mongoose, { Document, Schema } from 'mongoose';

export interface IReader extends Document {
    name: string;
    email: string;
    phone?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const ReaderSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: { type: String },
}, { timestamps: true });

export default mongoose.model<IReader>('Reader', ReaderSchema);
