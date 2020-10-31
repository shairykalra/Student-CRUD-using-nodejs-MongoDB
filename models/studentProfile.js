const mongoose = require('mongoose');
const studentProfileSchema = new mongoose.Schema({
    university:{
        type : String,
        required:[true,'Please enter your University Name'],
        trim:true
     },
    grade:{
        type:String,
        required:[true,'Please enter your Grade/Class'],
        trim:true
         },
    country:{
        type:String,
        required:[true,'Please enter your Country'],
        trim:true
         },
    state:{
        type:String,
        required:[true,'Please enter your State'],
        trim:true
    },
    city:{
        type:String,
        required:[true,'Please enter your City'],
        trim:true
    },
    pinCode:{
        type:Number,
        required:[true,'Please enter your PinCode'],
    },
    image:{
        type:String
    },
    gender:{
        type:String,
        enum:['Male','female'],
        required:[true,'Please enter your Gender'],
    },
    dob:{
        type:Date,
        required:[true,'Please enter your Date of Birth'],
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    // link id of another studentAuthentication schema to combine both schema like foreign key
    studentAuthentication:{
        type:mongoose.Schema.ObjectId,
        ref:'studentAuthentication',
        required:true
    }
});

//one student can insrert profile one time only
studentProfileSchema.index({studentAuthentication:1},{unique:true});

//model('modelName','SchemaNAme')
module.exports=mongoose.model('studentProfile',studentProfileSchema);