const express = require("express");
const router = express.Router();
const bugController = require("../Controllers/bugController");

router.route('/report').post(bugController.report);

module.exports = router;