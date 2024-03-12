const jwt=require('jsonwebtoken');
require('dotenv').config();

const jwtAuthMiddleware= (req, res, next)=>{
    //first check if token is available on authorization headers tab //req.headers.
    const authorization=req.headers.authorization;
    if(!authorization) return res.status(401).json({error:"Token not found"});
    // Extract the jwt token from requests headers.
    const token = authorization.split(' ')[1];
    if(!token){
      return res.status(401).json({error:'Unauthorized'});
    }

    try{
        //Verify the JWT token
        const decoded= jwt.verify(token, process.env.JWT_SECRET);
        // The decode value that comes out is payload.

        //Attach user Information to the request object
        req.user = decoded
        next();
    }catch(err){
        console.error(err);
        res.status(401),json({error: 'Invalid token'});
    }
}

const generateToken = (userData) =>{
    //Generate a new JWT token using user data, user data is basically a payload.
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn:30000});
}

module.exports={jwtAuthMiddleware, generateToken};