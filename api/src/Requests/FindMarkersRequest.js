const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class FindMarkersRequest {

    constructor(sqsQueue, allMarkersRequest) {
        const { user, project, analysisId, cluster1, cluster2 } = allMarkersRequest;
        this.queueUrl = sqsQueue;
        this.messageGroupId = uuidv4();
        this.messageDeduplicationId = uuidv4();
        this.messageBody = { 
            requestType: RequestTypes.FIND_MARKERS,
            user: user,
            project: project,
            analysisId: analysisId, 
            cluster1: cluster1,
            cluster2: cluster2
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

module.exports = FindMarkersRequest;