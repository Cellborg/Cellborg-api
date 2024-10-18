const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class ClusterSqsMessageRequest {

    constructor(sqsUrl, clusterplotData) {
      const { user, project, resolution } = clusterplotData;
      this.queueUrl = sqsUrl;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.CLUSTER,
        user: user,
        project: project,
        resolution: resolution
      };
    }
  
    getMessageParams() {
      return {
        QueueUrl: this.queueUrl,
        MessageGroupId: this.messageGroupId,
        MessageDeduplicationId: this.messageDeduplicationId,
        MessageBody: JSON.stringify(this.messageBody),
      };
    }
  }
  
module.exports = ClusterSqsMessageRequest;