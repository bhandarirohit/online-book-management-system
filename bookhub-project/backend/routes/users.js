const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET /users - Get all users
router.get('/', async (req, res) => {
    try {
        const [results] = await pool.execute('SELECT * FROM users ORDER BY id DESC');
        res.json(results);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// POST /users - Create a new user
router.post('/', async (req, res) => {
    try {
        console.log('📝 Received user data:', req.body);
        
        const { name, email, phone, dob, address, gender } = req.body;
        
        // Basic validation
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        // Simple insert query
        const query = `INSERT INTO users (name, email, phone, dob, address, gender) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [name, email, phone, dob, address, gender];
        
        console.log('🚀 Executing query:', query);
        console.log('📊 With values:', values);
        
        const [result] = await pool.execute(query, values);
        
        console.log('✅ User inserted successfully, ID:', result.insertId);
        
        // Return success
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: result.insertId,
                name,
                email,
                phone,
                dob,
                address,
                gender
            }
        });
        
    } catch (error) {
        console.error('❌ DATABASE ERROR:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ 
                success: false,
                error: 'This email is already registered. Please use a different email.' 
            });
        } else {
            res.status(500).json({ 
                success: false,
                error: 'Database error: ' + error.message 
            });
        }
    }
});

// GET /users/:id/reading-history
router.get('/:id/reading-history', async (req, res) => {
    try {
        const userId = req.params.id;
        const query = `
            SELECT rh.*, b.title, b.author, b.category, b.cover_url
            FROM reading_history rh 
            JOIN books b ON rh.book_id = b.id 
            WHERE rh.user_id = ? 
            ORDER BY rh.date_read DESC
        `;
        const [results] = await pool.execute(query, [userId]);
        res.json(results);
    } catch (error) {
        console.error('Error fetching reading history:', error);
        res.status(500).json({ error: 'Failed to fetch reading history' });
    }
});

// DELETE /users/:id - Delete a user by ID
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Validate user ID
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ error: 'Valid user ID is required' });
        }
        
        // Check if user exists
        const [checkResult] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        
        if (checkResult.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Delete the user (reading_history will be deleted automatically due to CASCADE)
        const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);
        
        res.json({ 
            success: true,
            message: 'User deleted successfully',
            deletedUser: checkResult[0]
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete user' 
        });
    }
});

module.exports = router;