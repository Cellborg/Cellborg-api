const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class PsuedotimeRequest {

    constructor(sqsQueue, psuedotimeRequest) {
    const { user, project, analysisId, points } = psuedotimeRequest;
    this.queueUrl = sqsQueue;
    this.messageGroupId = uuidv4();
    this.messageDeduplicationId = uuidv4();
    this.messageBody = { 
        requestType: RequestTypes.PSUEDOTIME,
        user: user,
        project: project,
        analysisId: analysisId, 
        points: points
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

module.exports = PsuedotimeRequest;