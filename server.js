const dotenv =require('dotenv');
dotenv.config({path:'./config/config.env'});

const connectDB= require('./config/db');
connectDB();

const express =require('express');
const app = express();

const morgan =require('morgan');
if(process.env.NODE_ENV==='DEVELOPMENT'){
    app.use(morgan('dev'))
}

const studentAuthentication=require('./routers/studentAuthentication');
app.use(express.json());
const path=require('path');
const fileupload = require('express-fileupload');
//File upload
app.use(fileupload());
//static folder
app.use(express.static(path.join(__dirname,'public')));

app.use('/api/student',studentAuthentication);


const errorHandler= require('./middleware/error');
app.use(errorHandler);

const cookieParser= require('cookie-parser');
app.use(cookieParser());





const PORT =process.env.PORT || 5000;
app.listen(PORT,console.log(`Server Running in ${process.env.NODE_ENV} Mode using port ${process.env.PORT}`));

process.on('unhandledRejection',(err,promise)=>{
    console.log(`Error: ${err.message}`);
    server.close(()=>process.exit(1));
})
