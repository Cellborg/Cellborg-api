const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class InitializeCellchatRequest {

    constructor(sqsQueue, initializeCellchatRequest) {
        const { user, project, analysisId } = initializeCellchatRequest;
        this.queueUrl = sqsQueue;
        this.messageGroupId = uuidv4();
        this.messageDeduplicationId = uuidv4();
        this.messageBody = { 
            requestType: RequestTypes.INIT_CELLCHAT,
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

module.exports = InitializeCellchatRequest;