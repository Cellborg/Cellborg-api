const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class QCPrePlotRequest {

    constructor(sqsQueue, qualityControlData) {
      const { user, project, dataset, mt } = qualityControlData;
      this.queueUrl = sqsQueue;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.PRE-PLOT,
        user: user,
        project: project,
        dataset: dataset,
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
  
module.exports = QCPrePlotRequest;