const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const async = require('hbs/lib/async');
const crypto = require ('crypto');
const sendEmail = require('./../Utils/email');
const { redirect } = require('express/lib/response');


const db = mysql.createConnection({
    host : process.env.host ,
    user : process.env.user ,
    password : process.env.password ,
    database :process.env.database
});

exports.register = (req,res) => {
    //console.log(req.body);
    const errors = {};
    const user_id = req.body.usrID;
    const metamask_id = req.body.MetaID;
    const email = req.body.email;
    const password = req.body.pswd;
    const confirmpassword = req.body.confirmpwd;
    const role = req.body.role;
    //const password_confirm = req.body.pswd_cnfr;
    if(!user_id || !metamask_id || !email || !password || !confirmpassword || !role){
        errors.empty = 'All fiels are required';
        return res.status(400).json(errors);
    }

    db.query('SELECT Metamask from Users where Metamask = ? OR Name = ? OR Email = ?', [metamask_id,user_id,email],async (error,result) =>{
        if(error){
            console.log(error);
        }

        if(result.length > 0 ){
            //console.log(result[0]);
            errors.olddeatails = 'Some of provided details are already in use';
            return res.status(400).json(errors);
        }

        //for confirm password
        else if(password !== confirmpassword){
            errors.passwordmatch = 'Password not maching';
            return res.status(400).json(errors);     
       }



        let hashedPassword = await bcrypt.hash(password,8);
        //console.log(hashedPassword);
        
        db.query('INSERT INTO Users SET ?',{Name:user_id,Role:role , Metamask: metamask_id, Email : email , Password : hashedPassword}, (error,result)=>{
            if(error){
                console.log(error);
            }
            else{
                //console.log(result);
                return res.status(200).json({success: true})
                //return res.render('login',
                //{ message: 'User Registerd'}
                //);
            }

        })
    })
//    res.send('Form submited');
}









//login
exports.login = (req,res) => {
    const errors = {}
   // console.log(req.body);
    let x = req.body.email;
    const password = req.body.pswd;
    const email = x.trim();
    if(!email || !password){
        errors.empty = 'All fiels are required';
        return res.status(400).json(errors);
    }

    db.query('SELECT * from Users where Email = ?',[email] ,async (error,result) =>{
        if(error){
            console.log(error);
        }
        else if(!result[0] || !await bcrypt.compare(password,result[0].Password) ){
           // console.log(result);
            errors.notvalid = 'Incorrect Email Or Password';
            return res.status(400).json(errors);
        }
        else{   //let str = 'HI'+result[0].Name
            const data = { 
                Name:result[0].Name,
                Role:result[0].Role, 
                Metamask:result[0].Metamask
            }
            const jsonData = JSON.stringify(data);
            req.session.jsonData = jsonData;
            req.session.isAuth = true;
            //console.log(req.session);
            // return res.redirect('/home');
            return res.status(200).json({success: true})
        }

    })
}

exports.logout = (req,res)=>{
    console.log("hiY");
    const errors = {}
req.session.destroy((err)=>{
    if(err){
        // console.log(err);
        errors.logout = err;
        return res.status(400).json(errors);
    }
    else{
    return res.status(200).json({success: true});}
});

}



exports.forgotpassword = (req,res) => {
    const errors = {}
    // console.log(req.body);
     let x = req.body.email;
     const email = x.trim();
     if(!email){
         errors.empty = 'All fiels are required';
         return res.status(400).json(errors);
     }
     console.log('else 0');
     db.query('SELECT * from Users where Email = ?',[email] ,async (error,result) =>{
         if(error){
            // console.log('super errorrrrrrrrrr');
             console.log(error);
             errors.error = error;
             return res.status(400).json(errors);
         }
         else if(!result[0]){
            // console.log(result);
             errors.notvalid = 'Incorrect Email';
            //  console.log('Incorrect Email')
             return res.status(400).json(errors);
         }
         else{   
            console.log('else 1');
            const resetToken = crypto.randomBytes(16).toString('hex');
            const  hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
            const tokentime = Date.now()+ 10 * 60 * 1000;
            console.log('else 2');
            db.query("INSERT INTO forgetpassword SET ?",{email:email,token:hashedToken,time : tokentime} ,async (error,result) =>{
                if(error){
                console.log(error);
                }
                else {
                    //console.log('SUCCESSSSSS!!!!');

                    const resetURL = `${req.protocol}://${req.get('host')}/auth/resetpassword/${resetToken}`;
                    const message = `we have recieved a password reset request. please use the below link to reset your password \n\n${resetURL} \n \n this link is only valid for 10 minutes. `

                    try{
                        await sendEmail({
                            email : email,
                            subject : "Password change request service",
                            message : message
                        });
                        console.log("-------DONE------");
                        return res.status(200).json({success: true});
                        
                    }
                    catch(err){
                        console.log(err);
                        console.log("-------error------");
                        errors.error = err;
                        return res.status(400).json(errors);
                    }
                    
                }
                
        
            });

         }
 
     });
 }

exports.resetpassword = (req,res) => {
    const errors = {}
const token = crypto.createHash('sha256').update(req.params.token).digest('hex');
db.query('SELECT email from forgetpassword where token = ? and time > ?',[token,Date.now()] ,async (error,result) =>{
    if(error){
        console.log(error);
    }
    else if(!result[0]){
        // console.log(result);
         errors.notvalid = 'Incorrect Email';
         console.log('Incorrect Email')
         return res.redirect('/auth/forgotpassword');
     }
    else{
        // const email = result[0].email;
        const data = {
            email: result[0].email,
            isallowd : true
        };
        const Data = JSON.stringify(data);
        req.session.Data = Data;
        // res.session.allowreset = true;
        console.log(req.session);
        res.redirect('/resetpassword');
    }
});    
}



exports.setnewpassword = async(req,res) =>{
    // console.log("in set");
    const errors = {}
    const data = JSON.parse(req.session.Data)
    const email = data.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;confirmpassword
    if(password === confirmpassword){
        const hashedPassword = await bcrypt.hash(password,8);
        db.query("UPDATE Users SET Password = ? where Email = ?",[hashedPassword,email] ,async (error,result) =>{
            if(error){
            console.log(error);
            }
            else{
                // console.log("in else in db query");
                req.session.destroy((err)=>{
                    if(err){
                        // console.log(err);
                        errors.logout = err;
                        console.log(err);
                        return res.status(400).json(errors);
                    }
                    else{
                        // console.log("in else final");
                        return res.status(200).json({success: true});
                    }
                });
            }
        });
    }
}


exports.docsetting = async(req,res) =>{

    const data = JSON.parse(req.session.jsonData);
    const sessionUserid = data.Name;

    const changedfullname = req.body.fullname;
    const formuserid = req.body.userid;

    if(formuserid === sessionUserid){
        db.query("SELECT * FROM Names WHERE Name = ?",[formuserid], async (error,result) =>{
            if(error){
                console.log(error);
            }
            else if(!result[0]){
                const sql = `INSERT INTO Names (Name, FullName, id) VALUES (?, ?, (SELECT id FROM Users WHERE Name = ?))`;

                db.query(sql,[formuserid,changedfullname,formuserid],
                async (error,result) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        return res.redirect('/doctor_setting');
                    }
                });
            }
            else{
                const sql = 'UPDATE Names SET FullName = ? WHERE Name = ?';
                db.query(sql,[changedfullname,formuserid],
                async (error,result) => {
                    if(error){
                        console.log(error);
                    }
                    else{
                        return res.redirect('/doctor_setting');
                    }
                });


            }

        });


    }


    

}