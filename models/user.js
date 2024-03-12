const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
//Define the Person schema
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
    mobile:{
        type:String,
    },
    email:{
        type:String
    },
    address:{
        type:String,
        required:true
    },
    aadharCardNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['voter', 'admin'],
        default:'voter'
    },
    isVoted:{
        type:Boolean,
        default:false
    }    
})


userSchema.pre('save', async function(next){
    const user = this;

    //Hash the password only if it has been modified (or is new)
    if(!user.isModified('password')){return next()}; //If person password is not modified than no need to hash password
    
    try{
        //hash password generation
        const salt=await bcrypt.genSalt(10);

        //hash password 
        const hashedPassword=await bcrypt.hash(user.password, salt);

        //Override the plain password with the hashed one
        user.password=hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})


userSchema.methods.comparePassword=async function(candidatePassword)
{
    try{
       const isMatch=await bcrypt.compare(candidatePassword, this.password);
       return isMatch;
    }catch(err){
         throw err;
    }
}

//Create Person model
const User= mongoose.model('User', userSchema);
module.exports=User;