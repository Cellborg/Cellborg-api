const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class AnnotationsRequest {

    constructor(sqsQueue, annotationsRequest) {
        const { user, project, analysisId, annotations } = annotationsRequest;
        this.queueUrl = sqsQueue;
        this.messageGroupId = uuidv4();
        this.messageDeduplicationId = uuidv4();
        this.messageBody = { 
            requestType: RequestTypes.ANNOTATIONS,
            user: user,
            project: project,
            analysisId: analysisId, 
            annotations: annotations
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

module.exports = AnnotationsRequest;