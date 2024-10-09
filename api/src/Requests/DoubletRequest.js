const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class QCDoubletRequest {

    constructor(sqsQueue, qualityControlData) {
      const { user, project, dataset,countMx, countMn, geneMx, geneMn, mitoMx, mitoMn} = qualityControlData;
      this.queueUrl = sqsQueue;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.QC_DOUBLET,
        user: user,
        project: project,
        dataset: dataset,
        countMx: countMx,
        countMn: countMn,
        geneMx:geneMx,
        geneMn:geneMn,
        mitoMx:mitoMx,
        mitoMn:mitoMn
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