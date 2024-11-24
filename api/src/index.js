const { IP, PORT, SERVER, ORIGIN, ENVIRONMENT, envvv }=require('./constants.js')
const express = require('express');
const http = require('http')
const socketIo = require('socket.io');
const cors = require('cors');
const compression = require('compression');
const { mongoClient } = require('./backendClients.js');
const jwtMiddleware = require('./Middleware/jwtMiddleware.js');
const errorHandlerMiddleware = require('./Middleware/errorHandlerMiddleware.js');

const app = express();
app.use(compression());
app.use(cors({ origin: ORIGIN }));
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ORIGIN,
    methods: ["GET", "POST"]
  }
});

const analysis_namespace = io.of('/analysisConnection');
var s3_dataset_prefix = "";
let userSocketMap = {};
let analysisSocketMap = {};
app.use(compression());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.text());

app.use(errorHandlerMiddleware);

/* jwtMiddleware function only applied to these routes */
app.use('/api/project', jwtMiddleware, require('./Routes/projectRoutes'));
app.use('/api/user', jwtMiddleware, require('./Routes/userRoutes.js'));
app.use('/api/qc', jwtMiddleware, require('./Routes/qcRoutes.js'));
app.use('/api/pa', jwtMiddleware, require('./Routes/paRoutes.js'));
app.use('/api/analysis', jwtMiddleware, require('./Routes/analysisRoutes.js'));
app.use('/api/bug',jwtMiddleware,require('./Routes/bugRoutes.js'));
/* all other routes below no need for auth middleware*/
app.use('/api/auth', require('./Routes/authRoutes.js'));
app.use('/api/hero', require('./Routes/heroRoutes.js'));

const CLEANUP_INTERVAL = 3600000; // 1 hour

io.on('connect', (socket) => {
  console.log('User connected');

  socket.on('RegisterConnection', (userID) => {
    if (!isValidUserID(userID)) {
      console.error('Invalid userID:', userID);
      socket.disconnect();
      return;
    }
    console.log(`Registered ${userID} in the socket map.`);
    socket.userID = userID; // Assign userID to socket to check for deletion
    userSocketMap[userID] = socket;
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userID);
    if (socket.userID) {
      delete userSocketMap[socket.userID];
    }
  });
});

analysis_namespace.on('connect', (socket) => {
  console.log("user connected to analysis socket connection");

  socket.on('RegisterConnectionAnalysis', (userID) => {
    if (!isValidUserID(userID)) {
      console.error('Invalid userID:', userID);
      socket.disconnect();
      return;
    }
    console.log(`Registered ${userID} in the analysis socket map.`);
    socket.userID = userID; // Assign userID to socket to check for deletion
    analysisSocketMap[userID] = socket;
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from analysis socket:', socket.userID);
    if (socket.userID) {
      delete analysisSocketMap[socket.userID];
    }
  });
})

setInterval(() => {
  console.log('Performing periodic cleanup...');
  for (const userID in userSocketMap) {
    if (!userSocketMap[userID].connected) {
      delete userSocketMap[userID];
    }
  }
  for (const userID in analysisSocketMap) {
    if (!analysisSocketMap[userID].connected) {
      delete analysisSocketMap[userID];
    }
  }
}, CLEANUP_INTERVAL);

function isValidUserID(userID) {
  //TODO: Check the format of the userID.
  //TODO: Verify if the userID is associated with a valid session.
  return typeof userID === 'string' && userID.length > 0;
}

app.get('/api/test', (req, res) => {
  console.log(req.ip);
  return res.status(200).json({ message: "Testing successful! 04-21-2024"});
});

app.post('/api/begin', (req, res) => {
  s3_dataset_prefix = req.body.prefix;
  console.log("Recieved dataset prefix:", s3_dataset_prefix)
  return res.status(200).json({ message: 'Successful' });
});

async function markDataset (user, project, dataset, stage) {
  try {
     const result = await mongoClient.db('Cellborg').collection('Projects').updateOne(
      { 'user': user, 'project_id': project, 'datasets.name': dataset },
      { $set: { 'datasets.$.status': stage }}
    );
    console.log(result);
  } catch (error) {
    console.error('Error updating project:', error);
  }
}

app.post('/api/sns_analysis_step', async (req, res) => {
  try {
    const message = req.body;
    const parsedMessage = JSON.parse(message);  
    console.log('Headers:', req.headers);
    console.log('Body:', message);
    console.log("Data: ", parsedMessage);
    if (parsedMessage.completed_step) {
      const user = parsedMessage.user;
      const project = parsedMessage.project;
      const analysisId = parsedMessage.analysisId;
      const step = parsedMessage.completed_step;

      console.log(`${user} completed step ${step} in project ${project} w/ analysis id: ${analysisId}`);

      // Update mongo project -> runs -> step entry to mark step completed
      /* write & call mongo api func for this */
      console.log("mongo entry needs to be updated... coming soon");

      if (analysisSocketMap[user]) {
        console.log("emitting socket...");
        if (step === "Feature_Plot") {
          const gene_name = parsedMessage.gene_name;
          analysisSocketMap[user].emit('FeaturePlot_ready', {user, project, analysisId, step, gene_name});
        } else {
          analysisSocketMap[user].emit(`${step}_Complete`, {user, project, analysisId, step});
        }
      }
      res.sendStatus(200);
    } else {
      res.status(400).send("Incomplete request");
    }
  } catch(error) {
    console.log("Error: ", error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/sns_pa',async(req, res)=>{
  try{
    const message = JSON.parse(req.body);
    
    console.log(message)
    const user = message.user;
    const project = message.project;
    const stage = message.stage;
    
    console.log(`${user} request for PA ${stage} in project ${project} has been completed`);
    console.log(userSocketMap[user])

    if(userSocketMap[user] && stage == "initialized"){
      console.log("emitting socket for initialized...");  
      userSocketMap[user].emit('PA_Initialize_Project', {user, project, stage});
    }else if(userSocketMap[user] && stage == "cluster"){
      const geneNames = message.geneNames;
      const clusters = message.clusters;

      console.log("emitting socket for clustering...");
      userSocketMap[user].emit('PA_Clustering_Complete', {user, project, geneNames,clusters, stage});
      
    }else if(userSocketMap[user] && stage == "gene_expression"){
      console.log("emitting socket for gene expression...");
      userSocketMap[user].emit('PA_Gene_Expression_Complete', {user, project, stage})
    }
    else if(userSocketMap[user] && stage == "annotations"){
      console.log("emitting socket for annotations...");
      userSocketMap[user].emit('PA_Annotations_Complete', {user, project, stage});
    }
    res.sendStatus(200);
    
  }catch(error) {
    console.log("Error: ", error);
    res.status(500).send('Internal Server Error');
  }
})
app.post('/api/sns', async (req, res) => {
  try {
    const message = req.body;
    const parsedMessageBody = JSON.parse(message);    
    console.log('Headers:', req.headers);
    console.log('Body:', message);
    console.log(parsedMessageBody);
    const messageBody = parsedMessageBody;
    console.log(messageBody);

    if (messageBody.complete === true) {
      const user = messageBody.user;
      const project = messageBody.project;
      const dataset = messageBody.dataset;
      const stage = messageBody.stage;

      console.log(`${user} request for QC ${stage} complete on dataset: ${dataset} in project ${project}`);

      //***Doing this on frontend now */
      // Update mongo project entry to mark dataset status as "complete"
      //await markDataset(user, project, dataset, stage);
      //console.log("mongo entry updated"); 

      // Send websocket message to frontend to mark dataset status as "complete"
      console.log(userSocketMap);
      console.log(userSocketMap[user]);
      if (userSocketMap[user] && stage == "prePlot") {
        console.log("emitting socket for pre-plot...");
        userSocketMap[user].emit('QC_Pre_Plot_Complete', { user, project, dataset, stage});
      }
      else if(userSocketMap[user] && stage == "doublet"){
        console.log("emitting socket for doublet...");
        userSocketMap[user].emit('QC_Doublet_Complete', {user, project, dataset, stage});
      }/*else if(userSocketMap[user] && stage == "FinishDoublet"){
        console.log("emitting socket connection for finishing QC");
        userSocketMap[user].emit('QC_Complete', {user, project, dataset});
      }*/
      res.sendStatus(200);
    } else {
      res.status(400).send('Incomplete request');
    }
  } catch(error) {
    console.log("Error: ", error);
    res.status(500).send('Internal Server Error');
  }
});

server.listen(PORT, IP, () => {
  console.log(`Cellborg API listening at ${SERVER} in the ${envvv} environment`);
});
