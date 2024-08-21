import express from 'express';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from .env file
config();

const __filename = fileURLToPath(
    import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
    }
});

// Create tables function
function createTables() {
    const queries = [
        `CREATE TABLE IF NOT EXISTS squares (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            plane TEXT,
            purpose TEXT,
            delineator TEXT,
            notations TEXT,
            details TEXT,
            extraData TEXT,
            class TEXT,
            parent TEXT,
            depth INTEGER,
            name TEXT,
            size TEXT,
            color TEXT,
            type TEXT,
            parent_id INTEGER
        )`,
        `CREATE TABLE IF NOT EXISTS chart_one (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            data TEXT,
            type TEXT,
            parent_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    queries.forEach((query) => {
        db.run(query, (err) => {
            if (err) {
                console.error('Error creating table:', err);
            } else {
                console.log('Table created successfully');
            }
        });
    });
}

// Create tables
createTables();

// Define routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET all squares
app.get('/squares', (req, res) => {
    db.all('SELECT * FROM squares', (err, rows) => {
        if (err) {
            console.error('Error fetching squares:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

// GET square by id
app.get('/squares/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM squares WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching square:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (!row) {
            res.status(404).json({ error: 'Square not found' });
        } else {
            res.json(row);
        }
    });
});

// POST new square
app.post('/squares', (req, res) => {
    const square = req.body;
    db.run('INSERT INTO squares (title, plane, purpose, delineator, notations, details, extraData, class, parent, depth, name, size, color, type, parent_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
        square.title,
        square.plane,
        square.purpose,
        square.delineator,
        square.notations,
        square.details,
        square.extraData,
        square.class,
        square.parent,
        square.depth,
        square.name,
        square.size,
        square.color,
        square.type,
        square.parent_id,
    ], function(err) {
        if (err) {
            console.error('Error creating square:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// PUT update square
app.put('/squares/:id', (req, res) => {
    const id = req.params.id;
    const square = req.body;
    db.run('UPDATE squares SET title = ?, plane = ?, purpose = ?, delineator = ?, notations = ?, details = ?, extraData = ?, class = ?, parent = ?, depth = ?, name = ?, size = ?, color = ?, type = ?, parent_id = ? WHERE id = ?', [
        square.title,
        square.plane,
        square.purpose,
        square.delineator,
        square.notations,
        square.details,
        square.extraData,
        square.class,
        square.parent,
        square.depth,
        square.name,
        square.size,
        square.color,
        square.type,
        square.parent_id,
        id,
    ], (err) => {
        if (err) {
            console.error('Error updating square:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ id: id });
        }
    });
});

// DELETE square
app.delete('/squares/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM squares WHERE id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting square:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ id: id });
        }
    });
});

// GET all chart_one
app.get('/chart_one', (req, res) => {
    db.all('SELECT * FROM chart_one', (err, rows) => {
        if (err) {
            console.error('Error fetching chart_one:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json(rows);
        }
    });
});

// GET chart_one by id
app.get('/chart_one/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM chart_one WHERE id = ?', [id], (err, row) => {
        if (err) {
            console.error('Error fetching chart_one:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (!row) {
            res.status(404).json({ error: 'Chart_one not found' });
        } else {
            res.json(row);
        }
    });
});

// POST new chart_one
app.post('/chart_one', (req, res) => {
    const chart_one = req.body;
    db.run('INSERT INTO chart_one (title, data, type, parent_id) VALUES (?, ?, ?, ?)', [
        chart_one.title,
        chart_one.data,
        chart_one.type,
        chart_one.parent_id,
    ], function(err) {
        if (err) {
            console.error('Error creating chart_one:', err)
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ id: this.lastID });
        }
    });
});

// PUT update chart_one
app.put('/chart_one/:id', (req, res) => {
    const id = req.params.id;
    const chart_one = req.body;
    db.run('UPDATE chart_one SET title = ?, data = ?, type = ?, parent_id = ? WHERE id = ?', [
        chart_one.title,
        chart_one.data,
        chart_one.type,
        chart_one.parent_id,
        id,
    ], (err) => {
        if (err) {
            console.error('Error updating chart_one:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.json({ id: id });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});