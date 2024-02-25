const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class KillServerRequest {

    constructor(sqsQueue, requestData) {
      const { user, project, dataset } = requestData;
      this.queueUrl = sqsQueue;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.KILL,
        user: user,
        project: project,
        dataset: dataset
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
  
module.exports = KillServerRequest;