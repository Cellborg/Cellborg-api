const RequestTypes = {
    INITIALIZE: "initializeProject",
    QC_PRE_PLOT: "QCPrePlot",
    QC_DOUBLET: "QCDoublet",
    QC_FINISH_DOUBLET: "QCFinishDoublet",
    VARIABLE_FEATURES: "variableFeatures",
    CLUSTER: "cluster",
    FEATURE_PLOT: "featurePlot",
    KILL: "killServer",
    HEATMAP: "heatmap",
    PSUEDOTIME: "psuedotime",
    DOTPLOT: "dotplot",
    VLNPLOTS: "vlnplots",
    ANNOTATIONS: "annotations",
    FIND_MARKERS: "findMarkers",
    ALL_MARKERS: "allMarkers",
    INIT_CELLCHAT: "initializeCellchat",
    NET_VISUAL: "netVisualPlot",
    PATHWAY_CONTRIBUTION: "pathwayContribution",
    SIGNALING_NETWORK: "signalingNetwork"
  };
  
module.exports = RequestTypes