require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ============ CLOUDINARY CONFIGURATION ============
// You need to add these credentials. Get them from your Cloudinary Dashboard
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME_HERE',
    api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY_HERE',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET_HERE'
});

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'choir_sheets',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
        resource_type: 'auto'
    }
});

const upload = multer({ storage: storage });

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

// ============ EXISTING ROUTES ============

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

// ============ NEW: UPLOAD PDF TO CLOUDINARY ============
app.post('/api/upload/pdf', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Return the Cloudinary URL
        res.json({ 
            url: req.file.path,
            public_id: req.file.filename,
            message: 'File uploaded successfully' 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ============ NEW: UPLOAD AUDIO TO CLOUDINARY ============
const audioStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'choir_audio',
        allowed_formats: ['mp3', 'm4a', 'wav', 'ogg'],
        resource_type: 'video'  // Cloudinary treats audio as video type
    }
});

const audioUpload = multer({ storage: audioStorage });

app.post('/api/upload/audio', audioUpload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        res.json({ 
            url: req.file.path,
            public_id: req.file.filename,
            message: 'Audio uploaded successfully' 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// POST new song (updated to handle Cloudinary URLs)
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
    res.json({ message: 'Choir Archive API is running with PostgreSQL and Cloudinary' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
