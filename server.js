const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Import sqlite3

const app = express();
const port = 5050;


app.use(express.json());
app.use(cors({
  origin: 'https://oscar-dejesus.github.io'  
})); 
const DBPATH= './Database.sqlite';

const db= new sqlite3.Database(DBPATH,(err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("connected")
    }
}) 

// Fix the route (missing slash and extra parentheses)
app.get('/api/message', (req, res) => {
  const sql = 'SELECT * FROM message';
  db.all(sql,[],(err,rows)=>{
    
    if(err){
        console.log(err.message);
    }else{
        res.json(rows);
    }
    
  })

});
app.post('/api/post',(req,res)=>{
  sql = 'INSERT INTO message(name,text) VALUES(?,?)'
    db.run(sql,[req.body.name,req.body.message],(err)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log("inserted")
        }
    })
})
app.delete('/api/remove',(req,res)=>{

  sql = 'DELETE FROM message WHERE id = ?'
    db.run(sql,[req.body.id],(err)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log("removed")
            res.json({ success: true, removedId: req.body.id });
        }
    })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
