const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); // Load environment variables from .env file

// Initialize Express application
const app = express();
const port = process.env.PORT || 3000; // Define the port for the server

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse incoming request bodies in JSON format

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Setup MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 5, // Maximum number of connections in the pool
  connectTimeout: 20000, // Increase the connection timeout to 20 seconds
  acquireTimeout: 20000, // Increase the acquire timeout to 20 seconds
  timeout: 20000 // Increase the timeout to 20 seconds
});

// API Routes

/**
 * Route to create a new square
 * This endpoint creates a new square in the database with the provided data.
 */
app.post("/squares", async (req, res) => {
  const {
    title,
    plane,
    purpose,
    delineator,
    notations,
    details,
    extraData,
    class: squareClass,
    parent,
    depth,
    name,
    size,
    color,
    type,
    parent_id
  } = req.body;
  const query = `INSERT INTO squares (title, plane, purpose, delineator, notations, details, extraData, class, parent, depth, name, size, color, type, parent_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  try {
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      conn.query(query, [title, plane, purpose, delineator, notations, details, extraData, squareClass, parent, depth, name, size, color, type, parent_id], (err, results) => {
        conn.release();
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(201).json({ message: 'Square created successfully', id: results.insertId });
      });
    });
  } catch (err) {
    console.error('Error creating square:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Route to get all squares
 * This endpoint retrieves and returns all squares from the database.
 */
app.get("/squares", async (req, res) => {
  const query = "SELECT * FROM squares";
  try {
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      conn.query(query, (err, results) => {
        conn.release();
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results);
      });
    });
  } catch (err) {
    console.error('Error fetching squares:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Route to get a single square by ID
 * This endpoint retrieves a square from the database based on the provided ID.
 */
app.get("/squares/:id", async (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM squares WHERE id = ?";
  try {
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      conn.query(query, [id], (err, results) => {
        conn.release();
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json(results[0]);
      });
    });
  } catch (err) {
    console.error('Error fetching square:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Route to update a square
 * This endpoint updates an existing square in the database based on the provided ID and data.
 */
app.put("/squares/:id", async (req, res) => {
  const { id } = req.params;
  const {
    title,
    plane,
    purpose,
    delineator,
    notations,
    details,
    extraData,
    class: squareClass,
    parent,
    depth,
    name,
    size,
    color,
    type,
    parent_id
  } = req.body;
  const query = `
    UPDATE squares 
    SET title = ?, plane = ?, purpose = ?, delineator = ?, notations = ?, details = ?, extraData = ?, class = ?, parent = ?, depth = ?, name = ?, size = ?, color = ?, type = ?, parent_id = ?
    WHERE id = ?
  `;
  try {
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      conn.query(query, [title, plane, purpose, delineator, notations, details, extraData, squareClass, parent, depth, name, size, color, type, parent_id, id], (err, results) => {
        conn.release();
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'Square updated successfully' });
      });
    });
  } catch (err) {
    console.error('Error updating square:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Route to delete a square
 * This endpoint deletes a square from the database based on the provided ID.
 */
app.delete("/squares/:id", async (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM squares WHERE id = ?";
  try {
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Error getting connection:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      conn.query(query, [id], (err, results) => {
        conn.release();
        if (err) {
          console.error('Error          executing query:', err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'Square deleted successfully' });
      });
    });
  } catch (err) {
    console.error('Error deleting square:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * Route to serve the form page
 * This route serves the form_page.html file from the 'public' directory.
 */
app.get("/form_page.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "form_page.html"));
});

/**
 * Default Route
 * This route serves the index.html file from the 'public' directory.
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});