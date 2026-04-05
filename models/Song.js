const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    slug: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    composer: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['entrance', 'kyrie', 'gloria', 'psalm', 'gospel-acclamation', 
               'offertory', 'sanctus', 'agnus-dei', 'communion', 'recessional', 'marian']
    },
    language: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    whenToSing: {
        type: String
    },
    pdfUrl: {
        type: String  // Link to Cloudinary
    },
    audioUrl: {
        type: String  // Link to Cloudinary
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Song', songSchema);
