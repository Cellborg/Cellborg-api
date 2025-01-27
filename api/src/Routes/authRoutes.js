const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/google').post(authController.google);
module.exports = router;