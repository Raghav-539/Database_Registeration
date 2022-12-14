const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",  // username
    password: "",  // password
    database: "logindetails"  // database name
})   // connection with database
connection.connect(function(error)
{
    if(error) throw error;

    console.log("Mysql is connected with database.")
})

module.exports=connection;