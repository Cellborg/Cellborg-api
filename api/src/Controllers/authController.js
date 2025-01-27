const { mongoClient } = require('../backendClients.js');
const {ENVIRONMENT} = require('../constants.js')
const {nanoid} = require('nanoid')


async function signup (request,response) {
    console.log(request.body)
    const {firstname,lastname,email,password}=request.body
    const data= await mongoClient.db(`Cellborg-${ENVIRONMENT}`).collection('Userdata').findOne({'email':email});
      if(data!=null){
        response.status(401).json({
          success:false,
          error: 'Email has already been used'
        })
      }else{
        const resp = await mongoClient.db(`Cellborg-${ENVIRONMENT}`).collection('Userdata').insertOne(
          {
            firstname: firstname,
            lastname: lastname,
            email:email,
            password:password,
            user_id: nanoid()
          }
        )
        response.status(200).json(resp)
      }
      
  }
  
async function login (request, response) {
    console.log("login attempt: ", request.body);
    const { username, password } = request.body;
    const authyUser= await authenticateUser(username, password)
    if (authyUser.valid) {
      const user = {
        id: 'admin',
        email: username,
        user_id:authyUser.user_id
      };
        response.status(200).json(user);
    } else {
        response.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
    }
  }

async function google (request, response) {
  console.log('request to login using google');
  const {email, name, googleId} = request.body;

  const data = await mongoClient.db(`Cellborg-${ENVIRONMENT}`).collection('Userdata').findOne({'email':email});
  if(data==null){
    response.status(401).json({
      success:false,
      error: 'User not found'
    })
  }
  else{
    const user = {
      id: 'admin',
      email: email,
      user_id:data.user_id
    };
    response.status(200).json(user);
  }

}
  
  const authenticateUser = async (email, password) => {
      console.log("Authenticating user: ", email)
      const data= await mongoClient.db(`Cellborg-${ENVIRONMENT}`).collection('Userdata').findOne({'email':email});
      if(data==null || data.password!=password){
        return {valid:false, user_id:null};
      }
      return {valid:true, user_id:data.user_id};
  };



module.exports = { signup, login, google };