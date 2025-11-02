const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// ✅ MIDDLEWARE FIRST - This is crucial!
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ THEN IMPORT ROUTES
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');

// ✅ THEN USE ROUTES
app.use('/books', bookRoutes);
app.use('/users', userRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'BookHub API is running!',
        timestamp: new Date().toISOString(),
        endpoints: {
            'GET /books': 'Get all books',
            'POST /books': 'Add a new book',
            'DELETE /books/:id': 'Delete a book',
            'GET /books/search?query=...': 'Search books by title or author',
            'GET /users': 'Get all users',
            'POST /users': 'Create new user',
            'GET /users/:id/reading-history': 'Get user reading history'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        time: new Date().toISOString()
    });
});

// Handle 404 - Route not found (FIXED VERSION)
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Server running on http://localhost:' + PORT);
    console.log('📚 BookHub API is ready to use!');
    console.log('⏰ Started at:', new Date().toLocaleString());
    console.log('='.repeat(50));
    console.log('💡 Available endpoints:');
    console.log('   GET  /books');
    console.log('   POST /books');
    console.log('   DELETE /books/:id');
    console.log('   GET  /books/search?query=...');
    console.log('   GET  /users');
    console.log('   POST /users');
    console.log('   GET  /users/:id/reading-history');
    console.log('='.repeat(50));
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    process.exit(0);
});