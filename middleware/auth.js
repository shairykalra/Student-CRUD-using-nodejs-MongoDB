const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../util/errorResponse');
const studentAuthentication = require('../models/studentAuthentication');
const { exists } = require('../models/studentAuthentication');

//Protect routes
exports.protect = asyncHandler(async(req,res,next)=>{
    let token;
    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer'))
    {
        token = req.headers.authorization.split(' ')[1];

    }
    // else if(req.cookies.token)
    // {
    //     token =req.cookies.token
    // }
    //MAke sure token exists
    if(!token){
        return next(new ErrorResponse('Not authorize to access ',401))
    }
    try{
       //verify Token
       const decoded = jwt.verify(token,process.env.JWT_SECRET)
        console.log(decoded);
        req.studentAuthentication = await studentAuthentication.findById(decoded.id);
        next();
    }
    catch(err)
    {
        return next(new ErrorResponse('Not authorize to access ',401))
    }
});

//Grant access to specific role

exports.authorize = (...role)=>{
 return(req,res,next)=>{
     if(!role.includes(req.studentAuthentication.role))
     {
         return next(new ErrorResponse(`role ${req.studentAuthentication.role} is not authorize to access the route`,403))
     }
     next();
 }
}
