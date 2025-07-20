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
router.post('/', async (req, res) => {
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

// Update a reader by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedReader = await Reader.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                email: req.body.email,
            },
            { new: true } // return updated doc
        );

        if (!updatedReader) {
            return res.status(404).json({ message: 'Reader not found' });
        }

        res.json(updatedReader);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

// Delete a reader by ID
router.delete('/:id', async (req, res) => {
    try {
        const deletedReader = await Reader.findByIdAndDelete(req.params.id);

        if (!deletedReader) {
            return res.status(404).json({ message: 'Reader not found' });
        }

        res.json({ message: 'Reader deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});


// Get a reader by ID
router.get('/:id', async (req, res) => {
    try {
        const reader = await Reader.findById(req.params.id);

        if (!reader) {
            return res.status(404).json({ message: 'Reader not found' });
        }

        res.json(reader);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

export default router;
