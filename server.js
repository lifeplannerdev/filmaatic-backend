const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { neon } = require('@neondatabase/serverless');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const sql = neon(process.env.DB_URL);

// Test endpoint
app.get('/test', (req, res) => {
  return res.send("ok");
});

// Enquiry submission endpoint
app.post('/api/enquiries', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Insert into database
    await sql`
      INSERT INTO enquiries (name, email, message) 
      VALUES (${name}, ${email}, ${message})
    `;

    return res.status(201).json({ 
      success: true,
      message: 'Enquiry submitted successfully'
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get all enquiries (for admin purposes)
app.get('/api/enquiries', async (req, res) => {
  try {
    const result = await sql`SELECT * FROM enquiries ORDER BY created_at DESC`;
    return res.status(200).json(result);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));