const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class PathwayContributionRequest {

    constructor(sqsQueue, pathwayContributionRequest) {
        const { user, project, analysisId, pathway } = pathwayContributionRequest;
        this.queueUrl = sqsQueue;
        this.messageGroupId = uuidv4();
        this.messageDeduplicationId = uuidv4();
        this.messageBody = { 
            requestType: RequestTypes.PATHWAY_CONTRIBUTION,
            user: user,
            project: project,
            analysisId: analysisId, 
            pathway: pathway
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

module.exports = PathwayContributionRequest;