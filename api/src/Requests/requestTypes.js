const RequestTypes = {
  INITIALIZE: "initializeProject",
  QC_PRE_PLOT: "QCPrePlot",
  QC_DOUBLET: "QCDoublet",
  QC_FINISH_DOUBLET: "QCFinishDoublet",
  VARIABLE_FEATURES: "variableFeatures",
  CLUSTER: "clustering",
  FEATURE_PLOT: "featurePlot",
  KILL: "killServer",
  HEATMAP: "heatmap",
  PROCESSING:"initializeProject",
  PSUEDOTIME: "psuedotime",
  DOTPLOT: "dotplot",
  VLNPLOTS: "vlnplots",
  GENEEXPRESSION: "gene_expression",
  ANNOTATIONS: "annotations",
  FIND_MARKERS: "findMarkers",
  ALL_MARKERS: "allMarkers",
  INIT_CELLCHAT: "initializeCellchat",
  NET_VISUAL: "netVisualPlot",
  PATHWAY_CONTRIBUTION: "pathwayContribution",
  SIGNALING_NETWORK: "signalingNetwork"
};

module.exports = RequestTypes