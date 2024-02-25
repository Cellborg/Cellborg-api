const { MongoClient } = require('mongodb');
const { ECSClient } = require("@aws-sdk/client-ecs");
const { SQSClient } = require("@aws-sdk/client-sqs");

const { US_WEST_2, MONGO_CONNECTION_STRING } = require('./constants.js')

const sqsClient = new SQSClient({ region: US_WEST_2 });
const ecsClient = new ECSClient({ region: US_WEST_2 });
const mongoClient = new MongoClient(MONGO_CONNECTION_STRING);

module.exports = { sqsClient, ecsClient, mongoClient }