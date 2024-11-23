const ProcessingRequest = require('../Requests/ProcessingRequest.js');
const ClusterSqsMessageRequest = require('../Requests/ClusterSqsMessageRequest.js');
const GeneExpressionRequest = require('../Requests/GeneExpressionRequest.js');
const AnnotationsRequest = require('../Requests/AnnotationsRequest.js');
const KillPAServerRequest = require('../Requests/KillPAServerRequest.js');
//const QCFinishDoublet = require('../Requests/finishDoubletRequest.js');
const {PA_CLUSTER, ENVIRONMENT } = require('../constants.js');

const {getSQSQueueUrl, createSQSQueue, deleteSQSQueue,
    runECSTask, sendSQSMessage, waitForTaskToRun} = require('./awsController.js');


async function prepareProcessing(req, res){
  const initProject = req.body;
  console.log("Recived request to start processing task...");
  const sqsKey = `${ENVIRONMENT}_${initProject.user}_${initProject.project}_PA.fifo`;
  try{
    //make sure queue is not initialized using undefined values
    if(initProject.user==undefined || initProject.project==undefined){
      throw new Error("parameters not set correctly!")
    }
    console.log("Creating queue")
    const createSQS = createSQSQueue(sqsKey);
    var pa_sqsUrl_v = "https://sqs.us-west-2.amazonaws.com/865984939637/"+sqsKey //only for testing
    console.log("Beginning PA Task from AWS Fargate", createSQS);
    console.log("Beginning PA Task from AWS Fargate w/constructed url", pa_sqsUrl_v);
    runECSTask(pa_sqsUrl_v, "PA")
    .then((result)=>{
      if (result) {
        return res.status(200).json({ taskArn: result });
      }
    })
    .catch((error) => {
      console.log(error);
      return res.status(500).json({ error: 'An error occurred' });
    }); 
  }catch(error){
    console.log("Error starting processing: ", error)
    return res.status(500).json({ error: 'An error occurred' });
  }}

async function beginProcessing(req, res){
  const initProject = req.body;
  console.log("Recived request to start initializing project...");
  const sqsKey = `${ENVIRONMENT}_${initProject.user}_${initProject.project}_PA.fifo`;
  const pa_sqsUrl = await getSQSQueueUrl(sqsKey);
  const SQSMessageRequest = new ProcessingRequest(pa_sqsUrl, initProject);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  }); 
}

async function clustering(req, res){
  const clusterBody = req.body;
  console.log("Recieved request to start clustering");
  const queueName = `${ENVIRONMENT}_${clusterBody.user}_${clusterBody.project}_PA.fifo`;
  const pa_sqsUrl = await getSQSQueueUrl(queueName);
  const SQSMessageRequest = new ClusterSqsMessageRequest(pa_sqsUrl, clusterBody);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  }); 
}
async function geneexpression(req, res){
    const geneBody = req.body;
    console.log("Recieved request to start gene expression");
    const queueName = `${ENVIRONMENT}_${geneBody.user}_${geneBody.project}_PA.fifo`;
    const pa_sqsUrl = await getSQSQueueUrl(queueName);
    const SQSMessageRequest = new GeneExpressionRequest(pa_sqsUrl, geneBody);
    sendSQSMessage(SQSMessageRequest.getMessageParams())
    .then(()=>{
        return res.status(200).json({message: 'Request successful'});
    })
    .catch((error)=>{
        console.log(error);
        return res.status(500).json({ error: 'An error occurred' });
    })
}
async function annotations(req, res){
  const annoBody = req.body;
  console.log("Recieved request to start annotating");
  const queueName = `${ENVIRONMENT}_${annoBody.user}_${annoBody.project}_PA.fifo`;
  const pa_sqsUrl = await getSQSQueueUrl(queueName);
  const SQSMessageRequest = new AnnotationsRequest(pa_sqsUrl, annoBody);
  sendSQSMessage(SQSMessageRequest.getMessageParams())
  .then(() => {
    return res.status(200).json({ message: 'Request successful' });
  })
  .catch((error) => {
    console.log(error);
    return res.status(500).json({ error: 'An error occurred' });
  }); 
};
async function paCleanup(req, res) {
    const request = req.body;
    console.log(request);
    const queueName = `${ENVIRONMENT}_${request.user}_${request.project}_PA.fifo`
    const qc_sqsUrl = await getSQSQueueUrl(queueName);
    const SQSMessageRequest = new KillPAServerRequest(qc_sqsUrl, request);
    try {
        const killServerResponse = await sendSQSMessage(SQSMessageRequest.getMessageParams());
        console.log("Kill PA Server request response: ", killServerResponse);
        const deleteSqsResponse = await deleteSQSQueue(qc_sqsUrl);
        console.log("Deleted PA SQS Queue response: ", deleteSqsResponse);
        return res.status(200).json({ message: 'Request successful' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'An error occurred' });
    }
}

async function checkPATaskStatus (req, res) {
    const request = req.body.taskArn;
    console.log("Received request to check status of AWS ECS Fargate task: ", request);
    waitForTaskToRun(request, PA_CLUSTER)
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
      console.log("Error getting the status of the PA task: ", request, error);
      res.status(500);
    })
  }
module.exports = {prepareProcessing,beginProcessing,clustering,geneexpression,annotations, paCleanup, checkPATaskStatus}