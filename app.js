const express = require("express");
const mysql = require("mysql");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const mysqlStore = require('express-mysql-session')(session);

const app = express();

dotenv.config ({path : './.env'});
const db = mysql.createConnection({
    host : process.env.host ,
    user : process.env.user ,
    password : process.env.password ,
    database :process.env.database
});

db.connect((error)=> {
    if(error){
        console.log(error);
    }
    else{
        console.log('Connected to database');
    }
});

const sessionStore = new mysqlStore({},db);

app.use(session({
    key:'my_session_key' ,
	secret: process.env.secret_key_session,
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
    cookie: {maxAge : 60*60*1000}
}));




const publicdirectory = path.join(__dirname, './public');
app.use(express.static(publicdirectory));



// parse URL encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended : false }));
// parse JSON bodies (as sent by API clients)
app.use(express.json());


app.set('view engine', 'hbs');




//define routes
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));
app.post('/uploadfile', require('./routes/fileupload'));
app.post('/docfile', require('./routes/docform'));
app.post('/userphoto', require('./routes/photouser'));
// app.post('/formupload', require('./routes/userform'));



// app.get('/',(req,res)=>{
//     //res.send("<h1>Hello world</h1>")
//     res.render("index");
// });

app.listen(5000,()=>{
console.log("Server started on 5000");
});





