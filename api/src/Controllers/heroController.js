const { mongoClient } = require('../backendClients.js');
const {ENVIRONMENT} = require('../constants.js')

async function accrequest(req,res){
    //console.log('request is here',req.body)
    const fieldValues=req.body
    try{
        const data=await mongoClient.db(`Cellborg-${ENVIRONMENT}`).collection('AccountReq').insertOne(fieldValues)
        res.status(200).json(data)
    }catch(error){
        console.log(`Error:${error}`)
        res.status(error.status).body(error)
    }

}

module.exports = {accrequest};