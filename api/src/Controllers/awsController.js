const { SendMessageCommand, CreateQueueCommand, DeleteQueueCommand, ListQueuesCommand } = require("@aws-sdk/client-sqs");
const { RunTaskCommand, DescribeTasksCommand } = require("@aws-sdk/client-ecs");
const {
  QC_CLUSTER,
  QC_TASK_DEFINITION,
  FARGATE,
  SUBNET,
  ENABLED,
  QC_CONTAINER_NAME,
  SQS_QUEUE_URL,
}=require('../constants.js')
const { ecsClient, sqsClient } = require('../backendClients.js');
const { ANALYSIS_CLUSTER, ANALYSIS_TASK_DEFINITION, CELLBORG_ANALYSIS_PY } = require("../constants.js");

const MAX_RETRIES = 30;           // # of times to check the task status
const WAIT_INTERVAL = 10000;      // Time (in ms) to wait between checks (10 sec.)

async function waitForTaskToRun(taskArn, taskCluster) {
  let retries = 0;
  const params = {
    cluster: taskCluster,
    tasks: [taskArn]
  };
  const command = new DescribeTasksCommand(params);
  const response = await ecsClient.send(command);
  const task = response.tasks[0];
  console.log("Task response is here: ", task);
  if (task && task.lastStatus === "RUNNING") {
    console.log("TASK IS RUNNING");
    return true; 
  }
  else if(task && task.lastStatus === "PENDING") {
    console.log("TASK IS PENDING");
    return false;
    // If not running, wait & retry
    //const prom =  await new Promise(res => setTimeout(res, WAIT_INTERVAL));
    //retries++;  
  }
  else if(task && task.lastStatus === null){
    console.log("Task.lastStatus is null")
    return false;
  }
  throw new Error("Task did not transition to RUNNING state in time");
}


async function getSQSQueueUrl(queueName) {  
  console.log("Getting SQS Queue: ", queueName);
  const listQueuesCommand = new ListQueuesCommand({
    QueueNamePrefix: queueName
  });
  try {
    const response = await sqsClient.send(listQueuesCommand);
    const matchingQueues = response.QueueUrls || [];
    if (matchingQueues.length > 0) {
      console.log(`${queueName} exist!`);
      return matchingQueues[0];
    }
    console.log(`${queueName} does not exist... creating new queue`);
    return await createSQSQueue(queueName);

  } catch (error) {
    console.error("Error listing or creating queue:", error);
    throw error;
  }
}

async function createSQSQueue(queueName) {
  console.log("Creating SQS queue: ", queueName);
  const command = new CreateQueueCommand({ 
    QueueName: queueName,
    Attributes: {
      "FifoQueue": "true",
      "ContentBasedDeduplication": "false"
    }
  });
  try {
    const response = await sqsClient.send(command);
    console.log("SQS created: ", response);
    return response.QueueUrl;
  } catch (error) {
    console.error("Error creating queue:", error);
    throw error;
  }
}

async function deleteSQSQueue(queueUrl) {
  const command = new DeleteQueueCommand({ QueueUrl: queueUrl });
  try {
    await sqsClient.send(command);
    console.log("Queue deleted successfully:", queueUrl);
  } catch (error) {
    console.error("Error deleting the queue:", error);
    throw error;
  }
}

// type will either be `QC` for quality control task, OR `Analysis` for analysis task
async function runECSTask(queue, type) {
  const cluster_name = type == "QC" ? QC_CLUSTER : ANALYSIS_CLUSTER;
  const task_def = type == "QC" ? QC_TASK_DEFINITION : ANALYSIS_TASK_DEFINITION;
  const override_name = type == "QC" ? QC_CONTAINER_NAME : CELLBORG_ANALYSIS_PY;

  const params = {
    cluster: cluster_name,
    launchType: FARGATE,
    taskDefinition: task_def,
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        subnets: [SUBNET],
        assignPublicIp: ENABLED
      }
    },
    overrides: {
      containerOverrides: [{
        name: override_name,
        environment: [
          {
            name: SQS_QUEUE_URL,
            value: queue
          }
        ]
      }]
    }
  };

  try {
    console.log(`Sending ${params} request to begin ${type} ECS task`);
    const response = await ecsClient.send(new RunTaskCommand(params));
    console.log(`Cellborg ${type} Task started with ECS:`, response.tasks[0].taskArn);
    return response.tasks[0].taskArn;
  } catch (error) {
    console.error("Error starting task:", error);
    return null;
  }
}


async function sendSQSMessage (data) {
    const command = new SendMessageCommand(data);
    try {
      const res = await sqsClient.send(command);
      console.log(res);
      return true;
    } catch (error) {
      console.log("Error sending request to SQS:", error);
      return false;
    }
  };

  
module.exports = { waitForTaskToRun, getSQSQueueUrl, createSQSQueue, deleteSQSQueue,
  runECSTask, sendSQSMessage }