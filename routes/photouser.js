const express = require("express");
const async = require("hbs/lib/async");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs');

const app = express();
const router = express.Router();
const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMTBlMWVhNC1mMTdjLTQyNTAtYjI1My02YzljNjFkODMxM2IiLCJlbWFpbCI6IjIwMDMwMzEwODAyM0BwYXJ1bHVuaXZlcnNpdHkuYWMuaW4iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNzA2MDZiM2JkYzYwOWE0ZmFkMzUiLCJzY29wZWRLZXlTZWNyZXQiOiJhNjZkNTlkOTg3NTVhY2U3M2Q1NjYxYThmY2VjNTY5MjRlMmI5ZmRmM2UxYzQwNDEzYzg5Y2Q3YzM3NjhiYjNmIiwiaWF0IjoxNjk0MjA5NTYxfQ.kFAtERo1_WTtRtLi-GynyweSs8xdLYkvvK5tAyob5_4';

app.use(bodyParser.json());

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        return cb(null, path.join(__dirname, "../uploads"));
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });
//console.log("111111")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));

let ipfsHash;
let url;
let fileName;
router.post("/userphoto", upload.single('inpFile'), (req, res, next) => {
    console.log(req.file);
    //console.log("2222")
    const pinFileToIPFS = async () => {
        const formData = new FormData();
        const src = req.file.path;
        fileName = req.file.originalname;

        const file = fs.createReadStream(src)
        formData.append('file', file)
        
        const pinataMetadata = JSON.stringify({
        name: req.file.filename,
        });
        formData.append('pinataMetadata', pinataMetadata);
        
        const pinataOptions = JSON.stringify({
        cidVersion: 0,
        })
        formData.append('pinataOptions', pinataOptions);

        try{
        const resp = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: JWT
            }
        });

// delete file
        try {
            fs.unlinkSync(req.file.path);
          
            console.log("Delete File successfully.");
          } catch (error) {
            console.log(error);
          }
// --------------------------------------

        ipfsHash = resp.data.IpfsHash;
        url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        console.log(url)
// --------------------------------------------
let fileObject = {
    fileName : 'userimg',
    url : `${url}`,
}
const data = JSON.parse(req.session.jsonData)
const Metamask = data.Metamask;
const Name = data.Name;
let fileObjectString = JSON.stringify(fileObject);

res.render("patient_setting",{fileObjectString, Metamask, Name});
// -----------------------------------------------
        console.log(resp.data);
        return resp.data;
        } catch (error) {
        console.log(error);
        // return resp.data;
        }
    }
    pinFileToIPFS();

})





module.exports = router;