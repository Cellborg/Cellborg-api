const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class ProcessingRequest {

    constructor(sqsQueue, qualityControlData) {
      const { user, project, datasets} = qualityControlData;
      this.queueUrl = sqsQueue;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.PROCESSING,
        user: user,
        project: project,
        datasets: datasets,
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
  
module.exports = ProcessingRequest;