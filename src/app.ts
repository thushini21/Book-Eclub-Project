import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import readerRoutes from './routes/Reader.routes';
import bookRoutes from "./routes/Book.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookclub';

app.use(cors());
app.use(express.json());
app.use('/api/readers', readerRoutes);
app.use('/api/books', bookRoutes);


mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

app.get("/", (req, res) => {
    res.send("📚 Book Club API is running!");
});


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;
