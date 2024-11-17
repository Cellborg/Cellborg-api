const QCPrePlotRequest = require('../Requests/QCPrePlotRequest.js');
const QCDoubletRequest = require('../Requests/DoubletRequest.js');
const ProcessingRequest = require('../Requests/ProcessingRequest.js');
const ClusterSqsMessageRequest = require('../Requests/ClusterSqsMessageRequest.js');
const AnnotationsRequest = require('../Requests/AnnotationsRequest.js');
//const QCFinishDoublet = require('../Requests/finishDoubletRequest.js');
const KillServerRequest = require('../Requests/KillServerRequest.js');
const { QC_CLUSTER, ENVIRONMENT } = require('../constants.js');
const { waitForTaskToRun, getSQSQueueUrl, createSQSQueue, deleteSQSQueue,
  runECSTask, sendSQSMessage } = require('./awsController.js');

async function performQCMetricsPrePlot(req, res){
  const request = req.body;
  console.log(request,'REQUEST FOR PERFORM IS HERE');
  const queueName = `${ENVIRONMENT}_${request.user}_${request.project}_${request.dataset}_QC.fifo`;
  console.log("Sending request to QC SQS: ", request);
  const qc_sqsUrl = await getSQSQueueUrl(queueName);
  const SQSMessageRequest = new QCPrePlotRequest(qc_sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  });
}
async function performQCDoublet(req, res){
  const request = req.body;
  console.log(request)
  const queueName = `${ENVIRONMENT}_${request.user}_${request.project}_${request.dataset}_QC.fifo`;
  const qc_sqsUrl = await getSQSQueueUrl(queueName);
  const SQSMessageRequest = new QCDoubletRequest(qc_sqsUrl, request);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  }); 
}

async function beginQualityControl (req, res) {
    console.log("Creating SQS for QC task");
    const request = req.body;
    
    const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.dataset}_QC.fifo`;
    try {
      //make sure queue is not initialized using undefined values
      if(request.user==undefined || request.project==undefined || request.dataset == undefined){
        throw new Error("parameters not set correctly!")
      }
      //create sqsqueue
      const qc_sqsUrl = createSQSQueue(sqsKey);
      var qc_sqsUrl_v = "https://sqs.us-west-2.amazonaws.com/865984939637/"+sqsKey //only for testing
      console.log("Beginning QC Task from AWS Fargate", qc_sqsUrl);
      console.log("Beginning QC Task from AWS Fargate w/constructed url", qc_sqsUrl_v);
      //start ecs task
      runECSTask(qc_sqsUrl_v, "QC")
      .then((result) => {
        if (result) {
          //call waitfortasktorun here before returning
          return res.status(200).json({ taskArn: result });
        }
      })
      .catch((error) => {
        console.log(error);
        return res.status(500).json({ error: 'An error occurred' });
      }); 
    } catch (error) {
      console.log("Error performing QC: ", error)
      return res.status(500).json({ error: 'An error occurred' });
    }
}
async function qualityControlCleanup (req, res) {
    const request = req.body;
    console.log(request);
    const queueName = `${ENVIRONMENT}_${request.user}_${request.project}_${request.dataset}_QC.fifo`
    const qc_sqsUrl = await getSQSQueueUrl(queueName);
    const SQSMessageRequest = new KillServerRequest(qc_sqsUrl, request);
    try {
      const killServerResponse = await sendSQSMessage(SQSMessageRequest.getMessageParams());
      console.log("Kill QC Server request response: ", killServerResponse);
      const deleteSqsResponse = await deleteSQSQueue(qc_sqsUrl);
      console.log("Deleted QC SQS Queue response: ", deleteSqsResponse);
      return res.status(200).json({ message: 'Request successful' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred' });
    }
}

async function checkQCTaskStatus (req, res) {
  const request = req.body.taskArn;
  console.log("Received request to check status of AWS ECS Fargate task: ", request);
  waitForTaskToRun(request, QC_CLUSTER)
  .then((response) => {
    if (response === true) {
      console.log("The ECS Task is now running")
      res.status(200).json({ready: true});
    }
    else if(response === false){
      console.log("The ECS Task is not running yet")
      res.status(200).json({ready:false})
    }
  }) 
  .catch((error) => {
    console.log("Error getting the status of the QC task: ", request, error);
    res.status(500);
  })
}

async function loadQualityControlPlot (req, res) {
    qualityControlPlotData = req.body;
    console.log("Recieved quality control plot data request:", qualityControlPlotData);
    const SQSMessageRequest = new QCSqsMessageRequest(qualityControlPlotData);
    sendSQSMessage(SQSMessageRequest.getMessageParams())
    .then(() => {
      return res.status(200).json({ message: 'Request successful' });
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred' });
    })
}



module.exports = {performQCMetricsPrePlot, beginQualityControl, qualityControlCleanup,
  checkQCTaskStatus, loadQualityControlPlot, performQCDoublet}
