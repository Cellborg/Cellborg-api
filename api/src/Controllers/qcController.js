const QualityControlRequest = require('../Requests/QualityControlRequest.js');
const KillServerRequest = require('../Requests/KillServerRequest.js');
const { QC_CLUSTER, ENVIRONMENT } = require('../constants.js');
const { waitForTaskToRun, getSQSQueueUrl, createSQSQueue, deleteSQSQueue,
  runECSTask, sendSQSMessage } = require('./awsController.js');

async function performQualityControl (req, res) {
    const request = req.body;
    console.log(request,'REQUEST FOR PERFORM IS HERE')
    const queueName = `${ENVIRONMENT}_${request.user}_${request.project}_${request.dataset}_QC.fifo`;
    console.log("Sending request to QC SQS: ", request);
    // check ECS task status here instead of in frontend
    // waitForTaskToRun(request)
    const qc_sqsUrl = await getSQSQueueUrl(queueName);
    const SQSMessageRequest = new QualityControlRequest(qc_sqsUrl, request);
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
    //TODO: add userID once we shift over from email to userID
    const sqsKey = `${ENVIRONMENT}_${request.user}_${request.project}_${request.dataset}_QC.fifo`;
    try {
      const qc_sqsUrl = createSQSQueue(sqsKey);
      var qc_sqsUrl_v = "https://sqs.us-west-2.amazonaws.com/865984939637/"+sqsKey //only for testing
      console.log("Beginning QC Task from AWS Fargate", qc_sqsUrl);
      console.log("Beginning QC Task from AWS Fargate w/constructed url", qc_sqsUrl_v);
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
    // Should have user, project, dataset
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
      console.loge("The ECS Task is not running yet")
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

module.exports = {performQualityControl, beginQualityControl, qualityControlCleanup,
  checkQCTaskStatus, loadQualityControlPlot}