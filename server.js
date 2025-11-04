const express = require('express');
const cors = require('cors');
const { Database } = require('@sqlitecloud/drivers');

const port =5050
const app = express();
app.use(express.json());

require('dotenv').config();
const { Pool } = require('pg');

const allowedOrigins = [
  'http://chatboard.online',
  'https://chatboard.online',
  'http://www.chatboard.online',
  'https://www.chatboard.online'
];

app.use(cors({
  origin: function(origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true); // allowed
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Store your URL in .env
  ssl: {
    rejectUnauthorized: false, // Required for Render
  },
});








app.get('/api/message', async (req, res) => {
  try {
   const result = await pool.query('SELECT * FROM messages');
    res.json(result.rows);

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.post('/api/post', async (req,res)=>{
  const sql = 'INSERT INTO messages(name,text) VALUES ($1, $2) RETURNING *'
  try{
    const insert = await pool.query(sql,[req.body.name,req.body.message]);
    res.json("posted")
    console.log("inserted")
  }catch (err){
      console.log(err.message);
  }
})

app.delete('/api/remove', async (req,res)=>{

  const sql = 'DELETE FROM messages WHERE id = $1 RETURNING *'
  try{
    const post = await pool.query(sql,[req.body.id]);
    res.json("removed")
  }catch(err){
      console.log(err.message);
  }
    
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
