import mongoose from 'mongoose';

const readerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    membershipDate: { type: Date, default: Date.now },
});

export default mongoose.model('Reader', readerSchema);
