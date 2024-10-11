const express = require("express");
const router = express.Router();
const qcController = require("../Controllers/qcController");

router.route('/performQCMetricsPrePlot').post(qcController.performQCMetricsPrePlot);
router.route('/beginQualityControl').post(qcController.beginQualityControl);
router.route('/qualityControlCleanup').post(qcController.qualityControlCleanup);
router.route('/checkQCTaskStatus').post(qcController.checkQCTaskStatus);
router.route('/loadQualityControlPlot').post(qcController.loadQualityControlPlot);
router.route('/performQCDoublets').post(qcController.performQCDoublet);
//router.route('finishDoublets').post(qcController.finishDoublet);
router.route('/beginProcessing').post(qcController.beginProcessing);
router.route('/clustering').post(qcController.clustering);
router.route('/annotations').post(qcController.annotations);

module.exports = router;