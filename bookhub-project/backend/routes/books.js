const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Function to fetch book cover from Open Library API
async function fetchBookCover(title, author) {
    try {
        const searchQuery = `${title} ${author}`.toLowerCase().replace(/\s+/g, '+');
        const response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}`);
        const data = await response.json();
        
        if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
            return `https://covers.openlibrary.org/b/id/${data.docs[0].cover_i}-M.jpg`;
        }
    } catch (error) {
        console.error('Error fetching book cover:', error);
    }
    return null;
}

// GET /books - Get all books
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.execute('SELECT * FROM books ORDER BY id DESC');
        res.json(results);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// POST /books - Add a new book
router.post('/', async (req, res) => {
    try {
        const { title, author, category, description, availability } = req.body;
        
        if (!title || !author || !category) {
            return res.status(400).json({ error: 'Title, author, and category are required' });
        }
        
        // Fetch book cover automatically
        const cover_url = await fetchBookCover(title, author);
        
        const query = `
            INSERT INTO books (title, author, category, description, availability, cover_url) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [title, author, category, description, availability || 'available', cover_url];
        
        const [result] = await pool.execute(query, values);
        
        const newBook = {
            id: result.insertId,
            title,
            author,
            category,
            description,
            availability: availability || 'available',
            cover_url
        };
        
        res.status(201).json(newBook);
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ error: 'Failed to add book' });
    }
});

// GET /books/search - Search books by title or author
router.get('/search', async (req, res) => {
    try {
        const query = req.query.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const searchQuery = `
            SELECT * FROM books 
            WHERE title LIKE ? OR author LIKE ? 
            ORDER BY id DESC
        `;
        const searchValue = `%${query}%`;
        
        const [results] = await pool.execute(searchQuery, [searchValue, searchValue]);
        res.json(results);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ error: 'Failed to search books' });
    }
});

// DELETE /books/:id - Delete a book by ID
router.delete('/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        
        if (!bookId || isNaN(bookId)) {
            return res.status(400).json({ error: 'Valid book ID is required' });
        }
        
        const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [bookId]);
        
        res.json({ 
            message: 'Book deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

module.exports = router;