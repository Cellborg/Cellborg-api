const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class VarFeatureSqsMessageRequest {

    constructor(sqsQueue, request) {
      const { user, project, analysisId, nFeatures } = request;
      this.queueUrl = sqsQueue;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.VARIABLE_FEATURES,
        user: user,
        project: project,
        analysisId: analysisId,
        nFeatures: nFeatures,
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
  
module.exports = VarFeatureSqsMessageRequest;