const express = require("express");
// const listController = require('../controllers/list');
const router = express.Router();
const mysql = require('mysql');

const db = mysql.createConnection({
    host : process.env.host ,
    user : process.env.user ,
    password : process.env.password ,
    database :process.env.database
});

//middleware authentication
const isAuth = (req,res,next)=>{
    console.log(req.session);
    if(req.session.isAuth){
        next()
    }
    else{
        return res.redirect('/login');
    }
}
const isNotAuth = (req,res,next)=>{
    console.log('notAuth');
    console.log(req.session);

    if(req.session.isAuth){
        console.log('if');
        return res.redirect('/home');
    }
    else{
        next();
    }
}

const ispatient = (req,res,next)=>{
    const data = JSON.parse(req.session.jsonData)
    const role = data.Role;
   if(role == 'doctor'){
    return res.redirect('/home');
   }
   else if(role == 'patient'){
     next();
   }
}

const isdoctor = (req,res,next)=>{
    const data = JSON.parse(req.session.jsonData)
    const role = data.Role;
   if(role == 'doctor'){
    next();
   }
   else if(role == 'patient'){
    return res.redirect('/home');
   }
}

const patientList = (req,res,next) => {
    db.query("SELECT * from Users where Role = 'patient' ",async (error,result) =>{
        if (error) {
            console.error('Error fetching users:', err);
            res.status(500).send('Error fetching users');
            return;
        }
        // return res.render('patientList',{ users: result })
        req.users = result;
        next();
    });

}







router.get('/',(req,res)=>{
    //res.send("<h1>Hello world</h1>")
   
    res.render("index");
});

// router.get('/list', listController.list);

router.get('/signup',isNotAuth,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    res.render("signup");
});

router.get('/login',isNotAuth,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    res.render("login");
});

router.get('/contact',isNotAuth,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    res.render("emailtest");
});

router.get('/home',isAuth,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    const data = JSON.parse(req.session.jsonData)
    const role = data.Role;
   if(role == 'doctor'){
    res.redirect('/doctor_dashboard');
   }
   else if(role == 'patient'){
   return res.redirect('/patient_dashboard');
   }
});


// Patient routes
router.get('/patient_dashboard',isAuth,ispatient,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    const data = JSON.parse(req.session.jsonData)
    const name = data.Name;
    const metamask = data.Metamask;
    res.render("patient_dashboard",{Name:name,Metamask:metamask});
});

router.get('/patient_form',isAuth,ispatient,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    const data = JSON.parse(req.session.jsonData)
    const name = data.Name;
    const metamask = data.Metamask;
    res.render("patient_form",{Name:name,Metamask:metamask});
});



router.get('/patient_setting',isAuth,ispatient,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    const data = JSON.parse(req.session.jsonData)
    const name = data.Name;
    const metamask = data.Metamask;

    const doclist = {};
    db.query("SELECT Name, Metamask from users where Role = 'doctor' ", (err, results) => {
        if (err) {
          console.error('Error executing the query:', err);
          return;
        }
      
        
        results.forEach((row) => {
            doclist[row.Metamask] = row.Name;
            
        });
        
        // console.log(doclist)
        const docdata = JSON.stringify(doclist);
        res.render("patient_setting",{Name:name,Metamask:metamask,docdata});
    });

    // res.render("patient_setting",{Name:name,Metamask:metamask,doclist});
});



//Doctor Routes
// router.get('/doctor_dashboard',isAuth,isdoctor,(req,res)=>{
//     //res.send("<h1>Hello world</h1>")
//     const data = JSON.parse(req.session.jsonData)
//     const name = data.Name;
//     const metamask = data.Metamask;
//     res.render("doctor_dashboard",{Name:name,Metamask:metamask});
// });
router.get('/doctor_dashboard',isAuth,isdoctor,patientList,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    const data = JSON.parse(req.session.jsonData)
    const name = data.Name;
    const metamask = data.Metamask;
    const users = req.users;
    res.render("doctor_dashboard",{Name:name,Metamask:metamask,users:users});
});

router.get('/doctor_UserView',isAuth,isdoctor,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    const data = JSON.parse(req.session.jsonData)
    const name = data.Name;
    const metamask = data.Metamask;
    res.render("doctor_UserView",{Name:name,Metamask:metamask});
});

router.get('/doctor_UserEdit',isAuth,isdoctor,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    const data = JSON.parse(req.session.jsonData)
    const name = data.Name;
    const metamask = data.Metamask;
    res.render("doctor_UserEdit",{Name:name,Metamask:metamask});
});

router.get('/doctor_setting',isAuth,isdoctor,(req,res)=>{
    //res.send("<h1>Hello world</h1>")
    const data = JSON.parse(req.session.jsonData)
    const name = data.Name;
    const metamask = data.Metamask;
    res.render("doctor_setting",{Name:name,Metamask:metamask});
});

//reset password

router.get('/resetpassword',(req,res)=>{
    const data = JSON.parse(req.session.Data)
    const email = data.email;
    const isallowd = data.isallowd;
    if(isallowd){
        res.render("resetpasswordfinal");
    }
    
    
});




module.exports = router;
























