import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import {authUser,verifyInternalKey,authorizeRoles} from "../middlewares/auth.middleware.js";
import express from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import candidateModel from "../models/candidate.model.js";

const authRouter = Router()

const storage = multer.diskStorage({
 destination:"uploads/",
 filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
 }
});

// const upload = multer({storage});

const upload = multer({
     storage,
     limits: { fileSize: 10 * 1024 * 1024 }, // 5MB max
     fileFilter: (req, file, cb) => {
         if (file.mimetype !== 'application/pdf') {
             return cb(new Error('Only PDF files are allowed'));
         }
         cb(null, true);
     }
  });

authRouter.post("/register",authController.registerUserController)


authRouter.post("/login",authController.loginUserController)


authRouter.get("/logout",authController.logoutUserController)


authRouter.get("/get-me", authUser,authController.getMeController)

authRouter.post("/chat", authController.handleChat)


authRouter.post('/process', authUser, authorizeRoles("HR_Manager", "Admin"),upload.single('resume'), authController.processCandidateResume);
// authRouter.get('/candidates', authController.getAllCandidates);
authRouter.get('/candidates',authUser, authorizeRoles("HR_Manager", "Admin"), authController.getAllCandidates);


export default authRouter