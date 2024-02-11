const express = require("express");
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.post('/docsetting', authController.docsetting);



router.post('/forgotpassword', authController.forgotpassword);
router.post('/setnewpassword', authController.setnewpassword);

router.get('/resetpassword/:token', authController.resetpassword);

module.exports = router;











