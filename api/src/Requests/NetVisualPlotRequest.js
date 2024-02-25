const RequestTypes = require("./requestTypes.js");
const { v4: uuidv4 } = require('uuid');

class NetVisualPlotRequest {

    constructor(sqsQueue, netVisualPlotRequest) {
        const { user, project, analysisId, pathway, plotType } = netVisualPlotRequest;
        this.queueUrl = sqsQueue;
        this.messageGroupId = uuidv4();
        this.messageDeduplicationId = uuidv4();
        this.messageBody = { 
            requestType: RequestTypes.NET_VISUAL,
            user: user,
            project: project,
            analysisId: analysisId, 
            pathway: pathway,
            plotType: plotType
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

module.exports = NetVisualPlotRequest;