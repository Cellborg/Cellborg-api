const { ObjectId } = require('mongodb');
const {nanoid}=require('nanoid');
const { mongoClient } = require('../backendClients.js');
const {ENVIRONMENT} = require('../constants.js')

async function projects (req, res) {
    const id = req.body.id;
    console.log("Finding projects for:", id)
    try {
      const projects = await mongoClient
      .db(`Cellborg-${ENVIRONMENT}`)
      .collection('Projects')
      .find({'user': id})
      .toArray();
      console.log(projects);
      res.status(200).json(projects);
    } catch (error) {
      console.log(error);
      res.status(error.status).body(error);
    }
}

async function getproject (req, res) {
  const projectId = new ObjectId(req.params.id);
  console.log("getting project with id:", projectId);
  try {
    const project = await mongoClient
    .db(`Cellborg-${ENVIRONMENT}`)
    .collection('Projects')
    .findOne({'_id' : projectId})
    res.status(200).json(project);
  } catch (error) {
    console.log(error);
    res.status(error.status).body(error);
  }
}


async function updateproject (req, res) {
    const data = req.body.project;
    const id = req.body.id;
    const objectId = new ObjectId(id);
    delete data._id;
    console.log(data, id, objectId);
  
    try {
      const result = await mongoClient.db(`Cellborg-${ENVIRONMENT}`)
      .collection('Projects')
      .updateOne({ _id: objectId }, { $set: data });
      console.log('Project updated successfully');
      res.status(200).json("success");
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500);
    }
}
  
async function newproject (req, res) {
    const data = req.body;
    data.project_id=nanoid()
    console.log(data);
    for (let i = 0; i < data.datasets.length; i++){
      data.datasets[i].dataset_id=nanoid()
    }
    try {
      const response = await mongoClient.db(`Cellborg-${ENVIRONMENT}`)
      .collection('Projects')
      .insertOne(data);
      console.log('New project inserted:', response.insertedId);
      res.status(200).json({mongo_response:response.insertedId, project:data})
    } catch (error) {
      console.log("Error inserting new project into mongodb:", error);
      res.status(500).json({ error: "Internal server error" });
    }
}
  
async function deleteproject (req,res) {
    const id=req.body.id
    const project=req.body.project
    const objectId = new ObjectId(id);
  
    console.log(project,id)
    try{
      const response=await mongoClient.db(`Cellborg-${ENVIRONMENT}`)
      .collection('Projects')
      .deleteOne({ _id: objectId})
      console.log('Successfully deleted', response)
      res.status(200).json(response)
    }catch(error){
      console.log('Error while trying to delete project',error)
      res.status(500).json({error:"Internal server error"})
    }
}
async function newDatasetId(req,res){
  try{
    res.status(200).json({newId:nanoid()})
  }catch(error){
    console.log('Error creating dataset id')
    res.status(500).json({error:'Internal server error'})
  }
}

module.exports = { projects, getproject, updateproject, newproject, deleteproject,newDatasetId};