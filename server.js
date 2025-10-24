const express = require('express');
const cors = require('cors');
const { Database } = require('@sqlitecloud/drivers');  // Import sqlite3

const app = express();
const port = 5050;


app.use(express.json());
app.use(cors({
  origin: 'https://oscar-dejesus.github.io'  
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
    const rows = await db.all('SELECT * FROM message');
    res.json(Array.isArray(rows) ? rows : []);
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
