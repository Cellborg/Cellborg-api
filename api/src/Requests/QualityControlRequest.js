const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class QualityControlRequest {

    constructor(sqsQueue, qualityControlData) {
      const { user, project, dataset, min, max, mt } = qualityControlData;
      this.queueUrl = sqsQueue;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.QUALITY_CONTROL,
        user: user,
        project: project,
        dataset: dataset,
        min: min,
        max: max,
        mt: mt
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
  
module.exports = QualityControlRequest;