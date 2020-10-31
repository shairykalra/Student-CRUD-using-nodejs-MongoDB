const path= require('path');
const studentAuthentication =require('../models/studentAuthentication');
const ErrorResponse =require('../util/errorResponse');
const asyncHandler=require('../middleware/async');
const studentProfile = require('../models/studentProfile');
const sendEmail=require('../util/sendEmail')
const crypto = require('crypto')

// @desc        Register Student
// @route       POST api/student/studentRegister

exports.createStudent = asyncHandler(async(req,res,next)=>{
    //constructor Destructing
    const{studentName,email,password,mobileNumber} =req.body;

    //create user
    const student= await studentAuthentication.create({
        studentName,email,password,mobileNumber
    });

    //CREATE TOKEN
   sendTokenResponse(student,200,res);
});

// @desc        Login Student
// @route       POST api/student/studentLogin

exports.loginStudent = asyncHandler(async(req,res,next)=>{
    const{email,password}=req.body;
    //validation
    if(!email || !password)
    {
        return next(new ErrorResponse('please provide email and password',400));
    }

    //check user
    const student =await studentAuthentication.findOne({email}).select('+password').populate('studentProfile');
    if(!student)
    {
        return next(new ErrorResponse('Invalid credential',401));
    }

    //check if password matches
    const isMatch = await student.matchPassword(password);
    if(!isMatch)
    {
         return next(new ErrorResponse('Invalid credential',401));
    }

    //CREATE TOKEN
    sendTokenResponse(student,200,res);
});

// @desc        Delete Student 
// @route       GET api/student/studentDelete
exports.deleteStudent=asyncHandler(async(req,res,next)=>{ 
    const studentId=await studentAuthentication.findById(req.studentAuthentication.id);
     if(!studentId)
    {
        return next(new ErrorResponse(
            `No Student Registered with id of ${req.studentAuthentication.studentId}`,404));
    }

    studentId.remove();
        res.status(200).json({success:true,data:{}})
});

// @desc        forgot passwords
// @route       POST api/student/studentforgetPassword
exports.forgotPassword =asyncHandler(async(req,res,next)=>{
    const student =await studentAuthentication.findOne({email:req.body.email});
    if(!student)
    {
         return next(new ErrorResponse('There is no user with email ',404));
    }
    // get reset token
    const resetToken=student.getResetPasswordToken();
    await student.save({validateBeforeSave:false})
    
   //create reset url
   const resetUrl=`${req.protocol}://${req.get('host')}/api/student/studentAuthentication/resetpassword/${resetToken}`
   const message = `you are receving email becase someon request for reset password plase make a put request
   in \n \n ${resetUrl}`;
   try {
       await sendEmail({
           email:student.email,
           subject:'password reset token',
           message
       });
        res.status(200).json({sucess:true,data:'email sent'});
   } catch (err) {
       console.log(err);
       student.ResetPasswordToken =undefined;
       student.ResetPasswordExpiere=undefined;
       await student.save({validateBeforeSave:false})
      return next(new ErrorResponse('Email couldnot send ',500));
       
   }
      res.status(200).json({sucess:true,data:student});
});
// @desc        reset passwords
// @route       PUT api/student/studentResetPassword

exports.resetPassword =asyncHandler(async(req,res,next)=>{
    //get hashed token and crypto for that
    const resetPasswordToken=crypto.
    createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
    const student =await studentAuthentication.findOne({resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
        });

    if(!student)
    {
         return next(new ErrorResponse('Invalid Token ',400));
    }
    //set new password
    student.password=req.body.password;
    student.ResetPasswordToken=undefined;
    student.ResetPasswordExpire-undefined;
    await student.save();
     sendTokenResponse(student,200,res);
});


//Get token from model, create cookie and send response
const sendTokenResponse = (student,statusCode,res)=>{
  const token = student.getSignedJwtToken();
  const option ={
      expires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRE * 24*60*60*1000),
      httpOnly:true
  };
  if(process.env.NODE_ENV==="production")
  {
    option.secure=true;
  }
  res.status(statusCode)
  .cookie('token',token,option)
  .json({sucess:true,token,data:student});
}