import express from 'express';
import Reader from '../models/Reader';

const router = express.Router();

// GET all readers
router.get('/', async (req, res) => {
    try {
        const readers = await Reader.find();
        res.json(readers);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }

});

// POST add new reader
router, async (req, res) => {
    const reader = new Reader({
        name: req.body.name,
        email: req.body.email,
    });

    try {
        const newReader = await reader.save();
        res.status(201).json(newReader);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }

});

export default router;
