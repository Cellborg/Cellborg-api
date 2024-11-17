const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class GeneExpressionRequest {

    constructor(sqsQueue, GeneExpressionRequest) {
        const { user, project, gene_list } = GeneExpressionRequest;
        this.queueUrl = sqsQueue;
        this.messageGroupId = uuidv4();
        this.messageDeduplicationId = uuidv4();
        this.messageBody = { 
            requestType: RequestTypes.GENEEXPRESSION,
            user: user,
            project: project, 
            gene_list: gene_list
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

module.exports = GeneExpressionRequest;