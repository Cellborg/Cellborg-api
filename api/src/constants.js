require('dotenv').config();

// environment
const ENV = process.env.NODE_ENV || 'dev';
const IS_DEV = ENV === 'dev';

// AWS constants
const AWS_BASE = "arn:aws:ecs:us-west-2:865984939637";
const CLUSTER_NAME = IS_DEV ? 'DevCluster' : `Cellborg-${ENV}-QC-Cluster`;
const ANALYSIS_CLUSTER_NAME = IS_DEV ? 'AnalysisCluster' : `Cellborg-${ENV}-Analysis-Cluster`;
const TASK_NAME = IS_DEV ? 'Cellborg_QC-Task' : `Cellborg-${ENV}-QC-Task`;
const ANALYSIS_TASK_NAME = IS_DEV ? 'Cellborg_Analysis-Task' : `Cellborg-${ENV}-Analysis-Task`;

// General configs
const PORT = process.env.PORT || 4200;
const SERVER = IS_DEV ? `http://localhost:${PORT}` : `${ENV}.api.cellborg.bio`;

module.exports = {
    // AWS Constants
    US_WEST_2: 'us-west-2',
    QC_CLUSTER: `${AWS_BASE}:cluster/${CLUSTER_NAME}`,
    ANALYSIS_CLUSTER: `${AWS_BASE}:cluster/${ANALYSIS_CLUSTER_NAME}`,
    QC_TASK_DEFINITION: `${AWS_BASE}:task-definition/${TASK_NAME}:${IS_DEV ? 12 : 31}`,
    FARGATE: "FARGATE",
    //TODO: we need to get this subnet dynamically? also why code shall be tied to a subnet.
    SUBNET: IS_DEV ? "subnet-0951d410d348bbd0a" : "subnet-0ff7168bbb1e17bd9", 
    ENABLED: "ENABLED",
    QC_CONTAINER_NAME: IS_DEV ? "cellborg_qc_py" : `cellborg-${ENV}-qc_py`,
    CELLBORG_ANALYSIS_PY: IS_DEV ? "cellborg_analysis_py" :  `cellborg-${ENV}-analysis_py`,
    SQS_QUEUE_URL: "SQS_QUEUE_URL",
    IP: '0.0.0.0',
    ANALYSIS_TASK_DEFINITION: `${AWS_BASE}:task-definition/${ANALYSIS_TASK_NAME}:${IS_DEV ? 4 : 1}`,

    // Requests
    BASE_QUEUE_URL: 'https://sqs.us-west-2.amazonaws.com/865984939637',
    clusterQueueURL: `${this.BASE_QUEUE_URL}/cellborgclusterplotqueue.fifo`,
    featureQueueURL: `${this.BASE_QUEUE_URL}/cellborgclusterplotqueue.fifo`,
    geneNameQueueURL: `${this.BASE_QUEUE_URL}/cellborgclusterplotqueue.fifo`,
    pcaQueueURL: `${this.BASE_QUEUE_URL}/cellborgclusterplotqueue.fifo`,
    QCQueueURL: `${this.BASE_QUEUE_URL}/cellborgclusterplotqueue.fifo`,
    varfeatQueueURL: `${this.BASE_QUEUE_URL}/cellborgclusterplotqueue.fifo`,

    // Configs
    ENVIRONMENT: ENV,
    envvv: ENV,  
    PORT,
    SERVER,
    ORIGIN: "*", // maybe different origins for dev and prod
    SECRET: process.env.JWT_SECRET,
    MONGO_CONNECTION_STRING: process.env.MONGO_CONNECTION_STRING
};
