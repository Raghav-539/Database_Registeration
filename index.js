
// var mysql = require('mysql')
var bodyParser = require('body-parser');
var express = require('express')
var app =express();
// var database = require("./database")

var jsonParser = bodyParser.json();

var path = require("path");
const connection = require('./database');   // creating conncetion with database
const { randomUUID } = require('crypto');   // used to generate a random UUID.

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // for linking style sheets and external javascript files 
app.set('view engine', 'ejs');           // passing ejs 

app.use(jsonParser);
app.use(bodyParser.urlencoded({ extended: false }))

// signup page route
app.get("/",function(request, response) {
    response.sendFile(__dirname+"/form.html")
})

// profile route
app.get("/profile/:uuid", function(request,response) {
    let uuid = request.params.uuid;
    console.log(uuid);
    connection.query('select * from logdetails where token = ?',[uuid], (error,results) => {
        if (error) {
            response.redirect("/login");
        } else if (results.length > 0) {
            response.render('profile', {uuid: uuid, result: results});
        } else {
            response.redirect("/login");
        }
    });
})

// login page route
app.get("/login", function(request,response) {
    response.sendFile(__dirname+"/login.html")
})

app.post("/login", function(request,response) {
    var uname = request.body.uname;
    var password = request.body.password;

    connection.query('select * from logdetails where uname = ? and password = ?',[uname, password], (error,results) => {
        if (error) {
            response.status(500).send(error);
        } else if (results.length > 0) {
            let uuid = randomUUID();
            connection.query('update logdetails set token = ? where uname = ?',[uuid, uname], (err, result) => {
                if (err) response.status(500).send(err);
                else {
                    response.cookie("token", uuid);
                    response.status(200).send({
                        message: "Login successful",
                        status: "success",
                        token: uuid
                    });
                }
            });
        } else {
            response.status(200).send({
                message: "Username or password incorrect",
                status: "failed",
            });
        }
    });
})

//  adding record 
app.post("/save",function(request,response)
{
    var uname = request.body.uname;
    var password = request.body.password;
    var fname = request.body.fname;
    var gender = request.body.gender;
    var contact = request.body.contact;

    connection.query('select * from logdetails where uname = ?',[uname], (error,results) => {
        if (error) {
            console.log(err);
            response.status(500).send(error);
        } else if (results.length > 0) {
            response.status(400).send("Username already exists");
        } else {
            connection.query('insert into logdetails(uname, password, fname, gender, contact) values(?,?,?,?,?)', [uname, password, fname, gender, contact], (err, result) => {
                if (err) response.status(500).send(err);
                else response.status(200).send("Record added successfully");
            });
        }
    });

})


// to display data admin pannel
app.get("/show/:id",function(request,response)
{
    connection.query('select * from logdetails where token = ?',[request.params.id], (error,results) => {
        if (error) {
            response.status(500).send(error);
        } else if (results.length > 0) {
            connection.query("select * from logdetails",function(error,result) {
                response.render("show",{result:result, uuid: request.params.id});
            });
        } else {
            response.redirect("/login");
        }
    });
})

// to logout 
app.get('/logout/:id', function(request, response) {
    connection.query('update logdetails set token = null where token = ?',[request.params.id], (err, result) => {
        if (err) request.status(500).send(err);
        else {
            response.cookie("token", "");
            response.redirect("/login");
        }
    });
});

app.get('/changePassword/:id', function(request, response) {
    connection.query('select * from logdetails where token = ?',[request.params.id], (error,results) => {
        if (error) {
            response.redirect("/login");
        } else if (results.length > 0) {
            console.log(results);
            response.render('change_password', {uuid: request.params.id, result: results[0]});
        } else {
            response.redirect("/login");
        }
    });
});

app.post("/update_rec/:id",function(request,response) {
    var password = request.body.newpassword;
    connection.query('select * from logdetails where token = ?',[request.params.id], (error,results) => {
        if (error) {
            response.redirect("/login");
        } else if (results.length > 0) {
            connection.query('update logdetails set password = ? where token = ?',[password, request.params.id], (err, result) => {
                if (err) response.status(500).send(err);
                else {
                    response.redirect("/profile/"+request.params.id);
                }
            });
        } else {
            response.redirect("/login");
        }
    });
});

app.get('*', function(req, res){
    res.send('This page doesn\' exist!', 404);
});



app.listen(7000, ()=>console.log("running"));
