const express = require('express');
const router = express.Router();
const Song = require('../models/Song');

// GET all songs
// URL: GET /api/songs
router.get('/', async (req, res) => {
    try {
        const songs = await Song.find().sort({ dateAdded: -1 });
        res.json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET songs by category
// URL: GET /api/songs/category/entrance
router.get('/category/:category', async (req, res) => {
    try {
        const songs = await Song.find({ category: req.params.category });
        res.json(songs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single song
// URL: GET /api/songs/chinecherem
router.get('/:slug', async (req, res) => {
    try {
        const song = await Song.findOne({ slug: req.params.slug });
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.json(song);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new song (admin upload)
// URL: POST /api/songs
router.post('/', async (req, res) => {
    const song = new Song({
        slug: req.body.slug,
        title: req.body.title,
        composer: req.body.composer,
        category: req.body.category,
        language: req.body.language,
        description: req.body.description,
        whenToSing: req.body.whenToSing,
        pdfUrl: req.body.pdfUrl,
        audioUrl: req.body.audioUrl
    });

    try {
        const newSong = await song.save();
        res.status(201).json(newSong);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE song
// URL: DELETE /api/songs/chinecherem
router.delete('/:slug', async (req, res) => {
    try {
        const song = await Song.findOneAndDelete({ slug: req.params.slug });
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        res.json({ message: 'Song deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
