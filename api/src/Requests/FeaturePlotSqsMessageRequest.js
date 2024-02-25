const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class FeaturePlotSqsMessageRequest {

    constructor(sqsUrl, featurePlotData) {
      const { gene_name, user, project, analysisId } = featurePlotData;
      this.queueUrl = sqsUrl;
      this.messageGroupId = uuidv4();
      this.messageDeduplicationId = uuidv4();
      this.messageBody = {
        requestType: RequestTypes.FEATURE_PLOT,
        gene_name: gene_name,
        user: user,
        project: project,
        analysisId: analysisId,
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
  
module.exports = FeaturePlotSqsMessageRequest;