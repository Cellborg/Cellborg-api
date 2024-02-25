const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class HeatmapAnalysisRequest {

    constructor(sqsQueue, heatmapRequest) {
    const { user, project, analysisId, geneNames } = heatmapRequest;
    this.queueUrl = sqsQueue;
    this.messageGroupId = uuidv4();
    this.messageDeduplicationId = uuidv4();
    this.messageBody = { 
        requestType: RequestTypes.HEATMAP,
        user: user,
        project: project,
        analysisId: analysisId, 
        geneNames: geneNames
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

module.exports = HeatmapAnalysisRequest;