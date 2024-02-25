const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class VlnPlotsRequest {

    constructor(sqsQueue, vlnPlotsRequest) {
    const { user, project, analysisId, genes } = vlnPlotsRequest;
    this.queueUrl = sqsQueue;
    this.messageGroupId = uuidv4();
    this.messageDeduplicationId = uuidv4();
    this.messageBody = { 
        requestType: RequestTypes.VLNPLOTS,
        user: user,
        project: project,
        analysisId: analysisId, 
        genes: genes
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

module.exports = VlnPlotsRequest;