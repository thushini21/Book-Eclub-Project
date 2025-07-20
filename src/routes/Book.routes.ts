import express from 'express';
import Book from '../models/Book';

const router = express.Router();

// GET all books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

// POST a new book
router.post('/', async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn
    });

    try {
        const newBook = await book.save();
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
});

// PUT update book availability
router.put('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book) {
            book.available = req.body.available;
            const updatedBook = await book.save();
            res.json(updatedBook);
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

// DELETE book
router.delete('/:id', async (req, res) => {
    try {
        const deletedBook = await Book.findByIdAndDelete(req.params.id);
        if (deletedBook) {
            res.json({ message: "Book deleted successfully" });
        } else {
            res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

export default router;
