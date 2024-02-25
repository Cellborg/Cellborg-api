const express = require("express");
const router = express.Router();
const projectController = require("../Controllers/projectController");

router.route('/projects').post(projectController.projects);
router.route('/getproject/:id').post(projectController.getproject);
router.route('/updateproject').post(projectController.updateproject);
router.route('/newproject').post(projectController.newproject);
router.route('/deleteproject').post(projectController.deleteproject);
router.route('/newDatasetId').post(projectController.newDatasetId);
module.exports = router;