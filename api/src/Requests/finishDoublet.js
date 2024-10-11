const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class QCFinishDoubletRequest {

    constructor(sqsQueue, qualityControlData) {
      const { user, project, dataset, doubletScore} = qualityControlData;
      this.queueUrl = sqsQueue;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.QC_FINISH_DOUBLET,
        user: user,
        project: project,
        dataset: dataset,
        doubletScore: doubletScore
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

module.exports = QCFinishDoubletRequest;