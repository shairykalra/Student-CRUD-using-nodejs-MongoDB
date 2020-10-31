const mongoose = require('mongoose');
const bcrypt =require('bcryptjs');
const jwt= require('jsonwebtoken');
const crypto =require('crypto');

const studentAuthenticationSchema = new mongoose.Schema({
    studentName:{
        type : String,
        required:[true,'Please enter your Name'],
        trim:true
     },
    email:{
        type:String,
        required:[true,'Please enter your Email'],
        unique:true,
        match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,'Please enter valid Email']
         },
    password:{
        type:String,
        min:6,
        max:12,
        select:false,
        required:[true,'your Password must be in between 6 to 12 Characters'],
         },
    mobileNumber:{
        type:Number,
        required:[true,'your enter Valid Mobile Number'],
        min:10
    },
    role:{
        type:String,
        default:'student'
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
    createdAt:{
        type:Date,
        default:Date.now
    }
},
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);

//Cascade delete profile when student is deleted
studentAuthenticationSchema.pre('remove',async function (next){
    await this.model('studentProfile').deleteMany({studentAuthentication:this._id})
    next();
})

//Reverse Populate with virtuals
studentAuthenticationSchema.virtual('studentProfile',{
    ref:'studentProfile',
    localField:'_id',
    foreignField:'studentAuthentication',
    justOne:false
})

//Encrypt password using bcrypt
studentAuthenticationSchema.pre('save',async function(next){
    if(!this.isModified('password'))
    {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt)
});

//Sign JWT and Return
studentAuthenticationSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({
        id:this._id},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRE})
};

//Match user dta with hash password in database
studentAuthenticationSchema.methods.matchPassword= async function(enteredPassword){
return await bcrypt.compare(enteredPassword,this.password);
}

//Generte and hash password token
studentAuthenticationSchema.methods.getResetPasswordToken=function(){
    //Genertae Token
    const resetToken = crypto.randomBytes(20).toString('hex');
    //Hash Token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    // set expiere
    this.resetPasswordExpire= Date.now()+10*60*1000;
    return resetToken;
};

module.exports=mongoose.model('studentAuthentication',studentAuthenticationSchema);