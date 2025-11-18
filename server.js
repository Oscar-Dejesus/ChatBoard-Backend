require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require("google-auth-library");
const jwt = require('jsonwebtoken');
const port =5050
const app = express();
const SECRET = process.env.SECRET_KEY
app.use(express.json());
app.use(cors());
const { Pool } = require('pg');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const allowedOrigins = [
  'https://chatboard.online',
  'https://www.chatboard.online'
];

app.use(cors({
  origin: function(origin, callback) {
    if (allowedOrigins.includes(origin)) {
      callback(null, true); 
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: {
    rejectUnauthorized: false, 
  },
});




app.post("/api/login",async (req,res)=>{
  const {Token} =req.body;

  try{
    const ticket = await client.verifyIdToken({
      idToken:Token,
      audience:process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload();
    const {email}= payload;
    const result = await pool.query('SELECT id,email,name FROM "users" WHERE email = $1 ',[email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = result.rows[0];
    const token = jwt.sign({id: user.id,name:user.name},SECRET,{expiresIn:"1y"})
    
    res.json({Token: token})
  }catch(err){
    
    console.log(err)
    return res.status(401).json({ error: "Invalid Google token" });
  }
})



app.post('/api/signup',async (req,res) =>{
  
  const { name,Token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken:Token,
      audience:process.env.GOOGLE_CLIENT_ID
    })
    const payload = ticket.getPayload();
    const{email} = payload
    const result = await pool.query('INSERT INTO "users"(name,email) VALUES($1,$2)',[name,email]);
    res.json({"Message":"Succesfully inserted"})
  
  } catch (err) {
    if (err.code === '23505') {
        console.error(err);
        return res.status(500).json({ error: 'Email already exists' });
    } else {
      console.error(err);
      return res.status(500).json({ error: 'Database query failed' });
    }
  }
})

app.post('/api/message', async (req, res) => {
  const {Token}= req.body
  
  try {
  const payload= jwt.verify(Token,SECRET);
  
  const result = await pool.query('SELECT * FROM messages');
  res.json(result.rows);
    
  } catch (err) {
    console.error(err);
    res.json({ error: 'Invalid Token' });
  }
});

app.post('/api/post', async (req,res)=>{
  const {Token}= req.body;
  const sql = 'INSERT INTO messages(name,text,user_id) VALUES ($1, $2, $3) RETURNING *'
  try{
    const payload= jwt.verify(Token,SECRET);
    const insert = await pool.query(sql,[payload.name,req.body.message,payload.id]);
    res.json("posted")
    console.log("inserted")
  }catch (err){
      res.json({error:"Invalid Token"})
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
