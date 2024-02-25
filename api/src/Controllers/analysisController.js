const BeginAnalysisRequest = require('../Requests/BeginAnalysisRequest.js');
const ClusterSqsMessageRequest = require('../Requests/ClusterSqsMessageRequest.js');
const VarFeatureSqsMessageRequest = require('../Requests/VarFeatureSqsMessageRequest.js');
const FeaturePlotSqsMessageRequest = require('../Requests/FeaturePlotSqsMessageRequest.js');
const HeatmapAnalysisRequest = require('../Requests/HeatmapAnalysisRequest.js');
const KillAnalysisServerRequest = require('../Requests/KillAnalysisServerRequest.js');
const PsuedotimeRequest = require('../Requests/PsuedotimeRequest.js');
const DotPlotRequest = require('../Requests/DotPlotRequest.js');
const VlnPlotsRequest = require('../Requests/VlnPlotsRequest.js');
const AnnotationsRequest = require('../Requests/AnnotationsRequest.js');
const AllMarkersRequest = require('../Requests/AllMarkersRequest.js');
const FindMarkersRequest = require('../Requests/FindMarkersRequest.js');
const InitializeCellchatRequest = require('../Requests/InitializeCellchatRequest.js');
const NetVisualPlotRequest = require('../Requests/NetVisualPlotRequest.js');
const PathwayContributionRequest = require('../Requests/PathwayContributionRequest.js');
const SignalingNetworkRequest = require('../Requests/SignalingNetworkRequest.js');
const { v4: uuidv4 } = require('uuid');
const {nanoid}=require('nanoid')
const { ANALYSIS_CLUSTER, ENVIRONMENT } = require('../constants.js')
const { waitForTaskToRun, getSQSQueueUrl, createSQSQueue, deleteSQSQueue,
  runECSTask, sendSQSMessage } = require('./awsController.js');

async function initializeAnalysisProject(ecsTaskArn, request, analysis_sqsUrl) {
  try {
    const isRunning = await waitForTaskToRun(ecsTaskArn, ANALYSIS_CLUSTER);
    if (!isRunning) {
      throw new Error("Task is not running"); // will trigger the catch block
    }
    await new Promise(resolve => setTimeout(resolve, 15000));

    const SQSMessageRequest = new BeginAnalysisRequest(analysis_sqsUrl, request);
    await sendSQSMessage(SQSMessageRequest.getMessageParams());
    console.log("sqs message sent...",SQSMessageRequest.getMessageParams());
    return true;
  } catch (error) {
    console.log("Error in initializeAnalysisProject: ", error.message);
    return false;
  }
}

async function analysisCleanup (req, res) {
    console.log("Cleaning up analysis resources...", req.body);
    const request = req.body;
    const sqsName = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
    console.log(`Deleting Analysis SQS Queue: ${sqsName}`);
    const analysis_sqsUrl = await getSQSQueueUrl(sqsName);
    const SQSMessageRequest = new KillAnalysisServerRequest(analysis_sqsUrl, request);
    try {
      const killServerResponse = await sendSQSMessage(SQSMessageRequest.getMessageParams());
      console.log("Kill QC Server request response: ", killServerResponse);
      const deleteSqsResponse = await deleteSQSQueue(analysis_sqsUrl);
      console.log("Deleted QC SQS Queue response: ", deleteSqsResponse);
      return res.status(200).json({ message: 'Request successful' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred' });
    }
}

async function beginAnalysis (req, res) {
    console.log("Beginning analysis...", req.body);
    const request = req.body;
    //TODO: add userID once we shift over from email to userID
    const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  
    console.log("Creating SQS queue for analysis");
    try {
      //refactor the sqs function to create sqs queue
      //const analysis_sqsUrl = await createQCQueue(sqsKey);
      const analysis_sqsUrl = await createSQSQueue(sqsKey);
      console.log("SQS Queue created, beginning Analysis Task from AWS Fargate");
      const taskResult = await runECSTask(analysis_sqsUrl, "Analysis");
      if (taskResult) {
        const initResponse = await initializeAnalysisProject(taskResult, request, analysis_sqsUrl);
        if (initResponse) {
          res.status(200).json({ message: 'success' });
        } else {
          throw new Error("Initialization failed");  // This will be caught by the outer catch block
        }
      }
    } catch (error) {
      console.log("Error: ", error.message);
      res.status(500).json({ error: 'An error occurred' });
    }
}

async function beginAnalysis2 (req, res) {
    const request = req.body;
    const analysis_sqsUrl = varfeatQueueURL;
    console.log("request: ", request);
    const SQSMessageRequest = new BeginAnalysisRequest(analysis_sqsUrl, request);
    sendSQSMessage(SQSMessageRequest.getMessageParams())
    .then(() => {
      return res.status(200).json({ message: 'success' });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ message: error });
    })
}

async function loadGeneFeaturePlot (req, res) {
    const featurePlotData = req.body;
    console.log("Received gene feature plot data request:", featurePlotData);
    const sqsKey = `${ENVIRONMENT}_${featurePlotData.user}_${featurePlotData.project}_${featurePlotData.analysisId}_AN.fifo`;
    const sqsUrl = await getSQSQueueUrl(sqsKey);
    //const sqsUrl = varfeatQueueURL;
    const SQSMessageRequest = new FeaturePlotSqsMessageRequest(sqsUrl, featurePlotData);
    sendSQSMessage(SQSMessageRequest.getMessageParams())
    .then(() => {
      return res.status(200).json({ message: 'Request successful' });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred' });
    })
}

async function loadClusterPlot (req, res) {
    const clusterPlotData = req.body;
    console.log("Recieved cluster plot data request:", clusterPlotData);
    const sqsKey = `${ENVIRONMENT}_${clusterPlotData.user}_${clusterPlotData.project}_${clusterPlotData.analysisId}_AN.fifo`;
    //const sqsUrl = varfeatQueueURL;
    const sqsUrl = await getSQSQueueUrl(sqsKey);
    const SQSMessageRequest = new ClusterSqsMessageRequest(sqsUrl, clusterPlotData);
    sendSQSMessage(SQSMessageRequest.getMessageParams())
    .then(() => {
      return res.status(200).json({ message: 'Request successful' });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred' });
    })
}

async function newanalysisid (req, res) {
    const id = nanoid();
    try {
      res.status(200).json(id);
    } catch (error) {
      console.log("Error sending analysis id: ", error);
      res.status(500).json("Server error");
    }
}

async function varfeatureanalysis (req, res) {
    const request = req.body;
    console.log("var feature analysis request:", request);
    const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
    const sqsUrl = await getSQSQueueUrl(sqsKey);
    //const sqsUrl = varfeatQueueURL;
    const SQSMessageRequest = new VarFeatureSqsMessageRequest(sqsUrl, request);
    sendSQSMessage(SQSMessageRequest.getMessageParams())
    .then(() => {
      return res.status(200).json({ message: 'Request successful' });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred' });
    })
}

async function heatmapanalysis (req, res) {
    const request = req.body;
    console.log("heatmap analysis request:", request);
    const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
    const sqsUrl = await getSQSQueueUrl(sqsKey);
    //const sqsUrl = varfeatQueueURL;
    const SQSMessageRequest = new HeatmapAnalysisRequest(sqsUrl, request);
    sendSQSMessage(SQSMessageRequest.getMessageParams())
    .then(() => {
      return res.status(200).json({ message: 'Request successful' });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred' });
    })
}

async function psuedotimeAnalysis (req, res) {
  const request = req.body;
  console.log("psuedotime analysis request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new PsuedotimeRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}

async function loadDotPlot(req, res) {
  const request = req.body;
  console.log("dot plot request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new DotPlotRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}

async function loadVlnPlots(req, res) {
  const request = req.body;
  console.log("violin plots request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new VlnPlotsRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}
async function findAllMarkersAnalysis(req, res) {
  const request = req.body;
  console.log("find all markers request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new AllMarkersRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}

async function findMarkersAnalysis(req, res) {
  const request = req.body;
  console.log("find markers request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new FindMarkersRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}

async function annotateClusters(req, res) {
  const request = req.body;
  console.log("cluster annotation request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new AnnotationsRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}

async function initCellchat(req, res) {
  const request = req.body;
  console.log("initialize cellchat request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new InitializeCellchatRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}
async function netVisualPlot(req, res) {
  const request = req.body;
  console.log("net visual plot data request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new NetVisualPlotRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}
async function pathwayContribution(req, res) {
  const request = req.body;
  console.log("pathway contribution request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new PathwayContributionRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}
async function signalingNetwork(req, res) {
  const request = req.body;
  console.log("signaling network request:", request);
  const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.analysisId}_AN.fifo`;
  const sqsUrl = await getSQSQueueUrl(sqsKey);
  //const sqsUrl = varfeatQueueURL;
  const SQSMessageRequest = new SignalingNetworkRequest(sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  })
}

module.exports = { analysisCleanup, beginAnalysis, beginAnalysis2, loadGeneFeaturePlot,
  loadClusterPlot, newanalysisid, varfeatureanalysis, heatmapanalysis, psuedotimeAnalysis,
  loadDotPlot, loadVlnPlots, annotateClusters, findAllMarkersAnalysis, findMarkersAnalysis,
  initCellchat, netVisualPlot, pathwayContribution, signalingNetwork
};