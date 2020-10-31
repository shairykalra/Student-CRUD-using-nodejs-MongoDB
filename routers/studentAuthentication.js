const express = require('express');

const{createStudent,loginStudent,deleteStudent,forgotPassword,resetPassword}=require('../controllers/studentAuthentication');
const { protect } = require('../middleware/auth');


const router= express.Router({mergeParams:true});

router.route('/studentRegister').post(createStudent);
router.route("/studentLogin").post(loginStudent);
router.route("/studentDelete").delete(protect, deleteStudent);
router.route("/studentForgotPassword").post(forgotPassword);
router.route("/resetPassword/:resettoken").put(resetPassword);

const{createStudentprofile,photoUpload,getMe,UpdateStudentprofile}=require('../controllers/studentProfile');

router.route("/studentProfile").post(protect, createStudentprofile);
router.route("/uploadImage").put(protect, photoUpload);
router.route("/studentProfile").get(protect, getMe);
router.route("/studentProfile").put(protect,UpdateStudentprofile);
//router.route("/studentProfile").delete( protect,DeleteStudentprofile);
module.exports=router;

