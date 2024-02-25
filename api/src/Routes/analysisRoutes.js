const express = require("express");
const router = express.Router();
const analysisController = require("../Controllers/analysisController");

router.route('/analysisCleanup').post(analysisController.analysisCleanup);
router.route('/beginAnalysis').post(analysisController.beginAnalysis);
router.route('/beginAnalysis2').post(analysisController.beginAnalysis2);
router.route('/loadGeneFeaturePlot').post(analysisController.loadGeneFeaturePlot);
router.route('/loadClusterPlot').post(analysisController.loadClusterPlot);
router.route('/newanalysisid').post(analysisController.newanalysisid);
router.route('/varfeatureanalysis').post(analysisController.varfeatureanalysis);
router.route('/heatmapanalysis').post(analysisController.heatmapanalysis);
router.route('/findAllMarkersAnalysis').post(analysisController.findAllMarkersAnalysis);
router.route('/findMarkersAnalysis').post(analysisController.findMarkersAnalysis);
router.route('/psuedotimeAnalysis').post(analysisController.psuedotimeAnalysis);
router.route('/loadDotPlot').post(analysisController.loadDotPlot);
router.route('/loadVlnPlots').post(analysisController.loadVlnPlots);
router.route('/annotateClusters').post(analysisController.annotateClusters);
router.route('/initCellchat').post(analysisController.initCellchat);
router.route('/netVisualPlot').post(analysisController.netVisualPlot);
router.route('/pathwayContribution').post(analysisController.pathwayContribution);
router.route('/signalingNetwork').post(analysisController.signalingNetwork);

module.exports = router;