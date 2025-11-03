const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');


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


app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        time: new Date().toISOString()
    });
});

// 404 - Route not found 
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method
    });
});

app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
 console.log('Server started successfully running on localhost:' + PORT);
    
});
// end server
process.on('SIGINT', () => {
    console.log('\nShutting down server gracefully...');
    process.exit(0);
});