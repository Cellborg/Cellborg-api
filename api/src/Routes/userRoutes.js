const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");

router.route('/delete/:id').post(userController.deleteuser);
router.route('/getuser/:id').post(userController.getuser);
router.route('/metadata').post(userController.metadata);
router.route('/test').post(userController.test);

module.exports = router;