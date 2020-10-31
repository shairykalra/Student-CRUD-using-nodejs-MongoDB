const ErrorResponse = require('../util/errorResponse')
const errorHandler = (err,req,res,next)=>
{
    let error = {...err};
    error.message=err.message;
    console.log(err);
    if(err.name==='CastError'){
        const message=`User not found with id of ${err.value}`;
        error= new ErrorResponse(message,404)
    }
    
    if(err.code===11000)
    {
        const message=`duplicate field value for ${Object.keys(err.keyValue)} having value ${Object.values(err.keyValue)}`;
        error= new ErrorResponse(message,400)
    }

    if(err.name==='ValidationError'){
         const message=Object.values(err.errors).map(val=>val.message);
        error= new ErrorResponse(message,400)
    }
    res.status(error.statusCode || 500).json({
        suceess:false,
        error:error.message || 'Server Error'
    });
};
module.exports = errorHandler;
