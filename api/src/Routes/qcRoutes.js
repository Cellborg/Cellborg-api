const express = require("express");
const router = express.Router();
const qcController = require("../Controllers/qcController");

router.route('/performQualityControl').post(qcController.performQualityControl);
router.route('/beginQualityControl').post(qcController.beginQualityControl);
router.route('/qualityControlCleanup').post(qcController.qualityControlCleanup);
router.route('/checkQCTaskStatus').post(qcController.checkQCTaskStatus);
router.route('/loadQualityControlPlot').post(qcController.loadQualityControlPlot);
module.exports = router;