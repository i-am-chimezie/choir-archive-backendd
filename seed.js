const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const songs = [
    {
        slug: "chinecherem",
        title: "Chinecherem",
        composer: "Sir Jude Nnam",
        category: "offertory",
        language: "Igbo",
        description: "One of Sir Jude Nnam's most beloved compositions. 'Chinecherem' means 'God thinks of me' in Igbo.",
        when_to_sing: "Offertory, concerts, festive occasions",
        pdf_url: "",
        audio_url: ""
    },
    {
        slug: "priestly-people",
        title: "Priestly People",
        composer: "Rev. Fr. John Okonkwo",
        category: "entrance",
        language: "English",
        description: "A stirring processional hymn celebrating the calling of the baptized as a royal priesthood.",
        when_to_sing: "Entrance procession, priesthood celebrations",
        pdf_url: "",
        audio_url: ""
    },
    {
        slug: "obi-dimkpa",
        title: "Obi Dimkpa",
        composer: "Prof. Laz Ekwueme",
        category: "entrance",
        language: "Igbo",
        description: "'Obi Dimkpa' means 'Strong Heart'. Composed by Nigeria's first professor of music.",
        when_to_sing: "Entrance of youth groups, confirmation Masses",
        pdf_url: "",
        audio_url: ""
    },
    {
        slug: "gloria-igbo",
        title: "Gloria in Excelsis",
        composer: "Sir Jude Nnam",
        category: "gloria",
        language: "Igbo",
        description: "Sir Jude Nnam's setting of the Gloria with Igbo harmonic progressions.",
        when_to_sing: "Sundays outside Advent and Lent",
        pdf_url: "",
        audio_url: ""
    },
    {
        slug: "take-and-sanctify",
        title: "Take and Sanctify",
        composer: "Sir Jude Nnam",
        category: "offertory",
        language: "English",
        description: "A modern classic inviting the congregation to offer themselves with the bread and wine.",
        when_to_sing: "Preparation of the altar",
        pdf_url: "",
        audio_url: ""
    },
    {
        slug: "agnus-dei",
        title: "Agnus Dei",
        composer: "Sir Jude Nnam",
        category: "agnus-dei",
        language: "Latin",
        description: "The ancient 'Lamb of God' prayer set with Igbo melodic inflections.",
        when_to_sing: "Breaking of bread",
        pdf_url: "",
        audio_url: ""
    }
];

async function seedDatabase() {
    for (const song of songs) {
        try {
            await pool.query(
                `INSERT INTO songs (slug, title, composer, category, language, description, when_to_sing, pdf_url, audio_url) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                 ON CONFLICT (slug) DO NOTHING`,
                [song.slug, song.title, song.composer, song.category, song.language, 
                 song.description, song.when_to_sing, song.pdf_url, song.audio_url]
            );
            console.log(`Added: ${song.title}`);
        } catch (err) {
            console.error(`Error adding ${song.title}:`, err.message);
        }
    }
    console.log('Seeding complete!');
    process.exit(0);
}

seedDatabase();
