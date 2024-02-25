const { ObjectId } = require('mongodb');
const { mongoClient } = require('../backendClients.js');
const {ENVIRONMENT} = require('../constants.js')

async function deleteuser (req, res) {
    const userId = new ObjectId(req.params.id);
    try {
      const result = await mongoClient.db(`Cellborg-${ENVIRONMENT}`)
      .collection('Userdata').deleteOne({"_id" : userId});
      if (result.deletedCount != 1) res.status(401).json({
        success: false,
        error: 'Failed to delete user'
      })
      else res.status(200).json({ message: "Sucessfully deleted user"});
    }
    catch (e) {
      console.log("Error deleting user", e);
      res.status(401).json({error: e, message: "ran into an error while deleting user"});
    }
}

async function getuser (req, res) {
  const user_id = req.params.id;
  try {
    const result = await mongoClient.db(`Cellborg-${ENVIRONMENT}`)
    .collection('Userdata').findOne({"user_id" : user_id});
    if (!result) res.status(401).json({
      success: false,
      error: 'Failed to get user'
    })
    else res.status(200).json({ success: true, message: result});
  }
  catch (e) {
    console.log("Error getting user", e);
    res.status(401).json({error: e, message: "ran into an error while getting user"});
  }
}
async function test (req, res) {
  console.log('testing jwt auth');
  console.log(req.ip);
  return res.status(200).json({ message: "Testing successful"});
}

async function metadata (req, res) {
  if(!req.body.update){
    const email=req.body.email
    const data= await mongoClient.db(`Cellborg-${ENVIRONMENT}`).collection('Userdata').findOne({'user_id':id})
    res.status(200).json(data.dataset)
  } else {
    const {email,name,uploaded,analyzed}=req.body
    const format={
    name:name,
    uploaded: uploaded,
    analyzed: analyzed
    }

    const data= await mongoClient.db(`Cellborg-${ENVIRONMENT}`).collection('Userdata').updateOne(
    {'user_id':id},
    {
      $push:{dataset: format}
    } 
    );
  }
}


module.exports = { deleteuser, getuser, metadata, test };