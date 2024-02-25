const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class AllMarkersRequest {

    constructor(sqsQueue, allMarkersRequest) {
        const { user, project, analysisId } = allMarkersRequest;
        this.queueUrl = sqsQueue;
        this.messageGroupId = uuidv4();
        this.messageDeduplicationId = uuidv4();
        this.messageBody = { 
            requestType: RequestTypes.ALL_MARKERS,
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

module.exports = AllMarkersRequest;