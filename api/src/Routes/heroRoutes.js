const express = require("express");
const router = express.Router();
const heroController = require("../Controllers/heroController");

router.route('/accrequest').post(heroController.accrequest);

module.exports = router;