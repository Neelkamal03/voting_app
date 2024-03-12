const express=require('express');
const router=express.Router();

const User=require('./../models/user.js');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');

router.post('/signup', async (req, res)=>{
    try{
       const data=req.body;
       if(data.role==='admin')
       {
         const _admin=await User.findOne({role:data.role})
         if(_admin)
         {
            return res.json({message:"admin already exists"});
         }
       }
       const newUser=new User(data);
       
       const response= await newUser.save();
       console.log('data saved');

       const payload={
          id:response.id,
       }
       
       const token=generateToken(payload);
       res.status(200).json({response, token});

    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})

router.post('/login', async (req, res)=>{
     try{
        // Extract username and password from request body
        const {aadharCardNumber, password} =req.body;

        //Find user by username
        const user= await User.findOne({aadharCardNumber: aadharCardNumber});
        
        //If user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(password)))
        {
           return res.status(401).json({error: "Invalid aadharcardNumber or password"});
        }
        
        //generate token
        const payload={
            id: user.id,
        }
        const token=generateToken(payload);
        //return token as response
        res.json({token});
     }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
     }
})

router.get('/profile', jwtAuthMiddleware, async (req, res)=>{
    try{
        const userData=req.user;
        
        const userId=userData.id;
        const user=await User.findById(userId);
        
        res.status(200).json(user);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/profile/password', jwtAuthMiddleware,async (req, res)=>{
    try{
       const userId=req.user;
       const {currentPassword, newPassword}=req.body;
       
       //Find user by Id so that we can update its data with new password
       const user=await User.findById(userId);

       //Checking the user by its previous password
        //If user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(currentPassword)))
        {
           return res.status(401).json({error: "Invalid aadharcardNumber or password"});
        }
       
        //Update the user password
        user.password=newPassword;
        await user.save();
       
       console.log('Password Updated');
       res.status(200).json({message:'Password Updated'});
    }catch(err){
       console.log(err);
       res.status(500).json({error:'Internal Server Error'});
    }
})

module.exports = router;
