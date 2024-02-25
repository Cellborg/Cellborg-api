const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class BeginAnalysisRequest {

    constructor(sqsQueue, request) {
    const { user, project, analysisId, datasets } = request;
    this.queueUrl = sqsQueue;
    this.messageGroupId = uuidv4();
    this.messageDeduplicationId = uuidv4();
    this.messageBody = { 
        requestType: RequestTypes.INITIALIZE,
        user: user,
        project: project,
        analysisId: analysisId, 
        datasets: datasets
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

module.exports = BeginAnalysisRequest;