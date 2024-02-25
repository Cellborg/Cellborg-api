const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class SignalingNetworkRequest {

    constructor(sqsQueue, signalingNetworkRequest) {
        const { user, project, analysisId, pathway } = signalingNetworkRequest;
        this.queueUrl = sqsQueue;
        this.messageGroupId = uuidv4();
        this.messageDeduplicationId = uuidv4();
        this.messageBody = { 
            requestType: RequestTypes.SIGNALING_NETWORK,
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

module.exports = SignalingNetworkRequest;