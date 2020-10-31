const path = require('path')
const studentProfile =require('../models/studentProfile');
const studentAuthentication =require('../models/studentAuthentication');
const ErrorResponse =require('../util/errorResponse');
const asyncHandler=require('../middleware/async');

// @desc        Create Student Profile
// @route       POST api/student/studentProfile

exports.createStudentprofile = asyncHandler(async(req,res,next)=>{
    req.body.studentAuthentication = req.studentAuthentication.id;
    const studentId=await studentAuthentication.findById(req.studentAuthentication.id);
    if(!studentId)
    {
        return next(new ErrorResponse(
            `No Student Registered with id of ${req.studentAuthentication.studentId}`,404));
    }
    const student=await studentProfile.create(req.body);
    res.status(201).json({success:true,data:student})
});

// @desc        Upload Student Image
// @route       PUT api/student/image

exports.photoUpload =asyncHandler(async(req,res,next)=>{
     const photoUpload= await studentAuthentication.findById(req.studentAuthentication.id);
    if(!photoUpload)
    {
        return next(
            new ErrorResponse(`Photo Not found with id ${req.studentAuthentication.id}`,404)
        );
    }
    if(!req.files)
    {
        return next(
            new ErrorResponse(`Please Upload a file`,400)
        );
    }
const file=req.files.file;
if(!file.mimetype.startsWith('image'))
    {
        return next(
            new ErrorResponse(`Please Upload an image file`,400)
        );
    }
    if(!file.size > process.env.MAX_FILE_UPLOAD)
    {
        return next(
            new ErrorResponse(`Please Upload a file LESS THAN ${process.env.MAX_FILE_UPLOAD}`,400)
        );
    }
    //create custom file name
    file.name=`image_${photoUpload._id}${path.parse(file.name).ext}`;
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`,async err=>{
        if(err)
        {
            console.error(err);
            return next(new ErrorResponse(`problrem with fil upload`),500)
        }
        const result = await studentProfile.findOneAndUpdate({studentAuthentication:req.studentAuthentication.id},{image:file.name});
        console.log(result);
        res.status(200).send({success:true,data:file.name})
    });
    console.log(file.name);
});

// @desc        Read Student Profile
// @route       GET api/student/studentProfile
exports.getMe =asyncHandler(async(req,res,next)=>{
    const studentId=await studentAuthentication.findById(req.studentAuthentication.id);
    if(!studentId)
    {
        return next(new ErrorResponse(
            `No Student Registered with id of ${req.studentAuthentication.studentId}`,404));
    }
    const student=await studentProfile.findOne({studentAuthentication:req.studentAuthentication.id}).populate({path:'studentAuthentication'});
    res.status(200).json({success:true,data:student})
});

// @desc        Update Student Profile
// @route       PUT api/student/studentProfile
exports.UpdateStudentprofile=asyncHandler(async(req,res,next)=>{ 
    const studentId=await studentAuthentication.findById(req.studentAuthentication.id);
     if(!studentId)
    {
        return next(new ErrorResponse(
            `No Student Registered with id of ${req.studentAuthentication.studentId}`,404));
    }
    const student=await studentProfile.findOneAndUpdate({studentAuthentication:req.studentAuthentication.id},req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({success:true,data:student})
});

// // @desc        Delete Student Profile
// // @route       DELETE api/student/studentProfile
// exports.DeleteStudentprofile=asyncHandler(async(req,res,next)=>{ 
//     const studentId=await studentAuthentication.findById(req.studentAuthentication.id);
//      if(!studentId)
//     {
//         return next(new ErrorResponse(
//             `No Student Registered with id of ${req.studentAuthentication.studentId}`,404));
//     }
//     await studentId.remove();
//         res.status(200).json({success:true,count:studentId.length,data:{}})
// });






