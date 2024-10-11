const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class QCDoubletRequest {

    constructor(sqsQueue, qualityControlData) {
      const { user, project, dataset,countMax, countMin, geneMax, geneMin, mitoMax, mitoMin} = qualityControlData;
      this.queueUrl = sqsQueue;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.QC_DOUBLET,
        user: user,
        project: project,
        dataset: dataset,
        countMax: countMax,
        countMin: countMin,
        geneMax:geneMax,
        geneMin:geneMin,
        mitoMax:mitoMax,
        mitoMin:mitoMin
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

module.exports = QCDoubletRequest;