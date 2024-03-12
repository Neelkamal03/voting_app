const express=require('express');
const router=express.Router();
const Candidate=require('./../models/candidate.js');
const User=require('./../models/user.js');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const mongoose=require('mongoose');

const checkAdminRole= async (userId)=>{
    try{
        const user=await User.findById(userId);
        if(user.role ==='admin')
        {
            return true;
        }
        else{
            return false;
        }
    }catch(err)
    {
        return false;
    }
}

router.post('/', jwtAuthMiddleware, async (req, res)=>{
    try{
       if(!await checkAdminRole(req.user.id))
         return res.status(404).json({message:'user not admin'});
         
       const data=req.body;

       const newCandidate=new Candidate(data);
       
       const response= await newCandidate.save();
       console.log('Candidate created');
       res.status(200).json({response});
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
    }
})


router.get('/', async (req, res)=>{
    try{
        const candidateData=await Candidate.find();
        const data=candidateData.map((data)=>{
            return{
                name:data.name,
                party:data.party,
                No_of_votes:data.voteCount,
            }
        })
        res.status(200).json(data);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

router.put('/:candidateId' ,jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!await checkAdminRole(req.user.id))
         return res.status(403).json({message:'user not admin'});

       const candidateId=req.params.candidateId;
       const updatedCandidateData=req.body;
       
       //Find user by Id so that we can update its data with new password
       const response=await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
           new:true,
          runValidators:true
       });

       if(!response){
        return res.send(404).json({error:'Candidate not found'});
       }
       console.log('candidate data updated');
       res.status(200).json(response);
    }catch(err){
       console.log(err);
       res.status(500).json({error:'Internal Server Error'});
    }
})

router.delete('/:candidateId' ,jwtAuthMiddleware, async (req, res)=>{
    try{
        if(!await checkAdminRole(req.user.id))
         return res.status(403).json({message:'user not admin'});

         const candidateId = req.params.candidateId;
         console.log('Deleting candidate with ID:', candidateId);
         
         const response = await Candidate.findByIdAndDelete(candidateId);
         console.log('Delete response:', response);

       if(!response){
        return res.sendStatus(404).json({error:'Candidate not found'});
       }
       console.log('candidate data deleted');
       return res.status(200).json();
    }catch(err){
        console.error('Error deleting candidate:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.post('/vote/:candidateId',jwtAuthMiddleware, async (req, res)=>{
    const candidateId=req.params.candidateId;
    const userId=req.user.id;
    
    try{
       const candidate=await Candidate.findById(candidateId);
       
       if(!candidate){
          return res.status(404).json({message:'Candidate not found'});
       }

       const user = await User.findById(userId);
       if(!user){
        return res.status(404).json({message:'User not found'});
       }

      if(user.isVoted){
         return res.status(400).json({message:'User have already voted'});
      }

      if(user.role =='admin'){
         return res.status(403).json({message:'Admin cannot vote'});
      }
      
      candidate.votes.push({user:userId});
      candidate.voteCount++;

      await candidate.save();

      //Update the user document
      user.isVoted=true;
      await user.save();
      res.status(200).json({message:'vote recorded successfully'});
    }catch(err){
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get('/vote/count', async (req, res)=>{
    try{
        const candidates=await Candidate.find().sort({voteCount:'desc'});

        //Mapping the candidates to return their name and votecount
        const voteRecord=candidates.map((data)=>{
            return{
                party:data.party,
                count:data.voteCount
            }
        });
       return res.status(200).json(voteRecord);
    }catch(err){
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
module.exports = router;
