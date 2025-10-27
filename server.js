const express = require('express');
const cors = require('cors');
const { Database } = require('@sqlitecloud/drivers');  // Import sqlite3

const app = express();
const port = 5050;


app.use(express.json());
const allowedOrigins = [
  'http://chatboard.online',
  'https://chatboard.online',
  'http://www.chatboard.online',
  'https://www.chatboard.online'
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);

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
const DBPATH= 'sqlitecloud://cohza82rvz.g6.sqlite.cloud:8860/auth.sqlitecloud?apikey=HrVGdAYYxb7wE0fSAHFbosEULOq2saL8By3K76OMQag';
const db = new Database(DBPATH);

(async () => {
  try {
    const rows = await db.all('SELECT * FROM message');
    console.log(rows);
  } catch (err) {
    console.error(err);
  }
})();
// Fix the route (missing slash and extra parentheses)
app.get('/api/message', async (req, res) => {
  try {
   const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM message', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    res.json(rows);
    console.log('Rows returned:', rows);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.post('/api/post', async (req,res)=>{
  const sql = 'INSERT INTO message(name,text) VALUES(?,?)'
  try{
    const insert = await db.run(sql,[req.body.name,req.body.message]);
    console.log("inserted")
  }catch (err){
      console.log(err.message);
  }
})
app.delete('/api/remove', async (req,res)=>{

  const sql = 'DELETE FROM message WHERE id = ?'
  try{
    const post = await db.run(sql,[req.body.id]);
    console.log("removed")
  }catch(err){
      console.log(err.message);
  }
    
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
