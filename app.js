let sql;
const sqlite3 =require('sqlite3').verbose();

const DBPATH= './Database.sqlite';

const db= new sqlite3.Database(DBPATH,(err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("connected")
    }
}) 

const createTableSQL = `
    CREATE TABLE IF NOT EXISTS message(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        text TEXT
    )
`;

db.run(createTableSQL,(err)=>{
    if(err){
        console.log(err.message);
    }
    sql = 'INSERT INTO message(id,name,text) VALUES(?,?,?)'
    db.run(sql,[1,"oscar","hello"],(err)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log("inserted")
        }
    })
})


function insert(name,text){
    sql = 'INSERT INTO message(name,text) VALUES(?,?)'
    db.run(sql,[name,text],(err)=>{
        if(err){
            console.log(err.message);
        }else{
            console.log("inserted")
        }
    })
    
}



