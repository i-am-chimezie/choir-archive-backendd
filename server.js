require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Create table if not exists
const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS songs (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                composer VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                language VARCHAR(100) NOT NULL,
                description TEXT,
                when_to_sing TEXT,
                pdf_url TEXT,
                audio_url TEXT,
                date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database table ready');
    } catch (err) {
        console.error('Error creating table:', err);
    }
};

createTable();

// GET all songs
app.get('/api/songs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM songs ORDER BY date_added DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET songs by category
app.get('/api/songs/category/:category', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM songs WHERE category = $1', [req.params.category]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single song
app.get('/api/songs/:slug', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM songs WHERE slug = $1', [req.params.slug]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new song
app.post('/api/songs', async (req, res) => {
    const { slug, title, composer, category, language, description, whenToSing, pdfUrl, audioUrl } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO songs (slug, title, composer, category, language, description, when_to_sing, pdf_url, audio_url) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
             RETURNING *`,
            [slug, title, composer, category, language, description, whenToSing, pdfUrl, audioUrl]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE song
app.delete('/api/songs/:slug', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM songs WHERE slug = $1 RETURNING *', [req.params.slug]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.json({ message: 'Song deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'Choir Archive API is running with PostgreSQL' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
