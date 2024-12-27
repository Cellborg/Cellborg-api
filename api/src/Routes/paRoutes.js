const express = require("express");
const router = express.Router();
const paController = require("../Controllers/paController");


router.route('/prepareProcessing').post(paController.prepareProcessing)
router.route('/beginProcessing').post(paController.beginProcessing);
router.route('/clustering').post(paController.clustering);
router.route('/geneexpression').post(paController.geneexpression);
router.route('/annotations').post(paController.annotations);
router.route('/paCleanup').post(paController.paCleanup);
router.route('/checkPAStatus').post(paController.checkPATaskStatus);

module.exports = router;
