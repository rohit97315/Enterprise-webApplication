import userModel from "../models/user.model.js";
import tokenBlacklistModel from "../models/blaklist.model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'
import FormData from 'form-data';
import candidateModel from "../models/candidate.model.js";



async function registerUserController(req,res){
    try{
    const {username,email,password,role} = req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message:"Please provide username ,email, password"
        })
    }

    const allowedRoles = ['Admin', 'HR_Manager', 'Employee'];
     if (role && !allowedRoles.includes(role)) {
         return res.status(400).json({
             message: `Invalid role. Must be one of: ${allowedRoles.join(', ')}`
         });
     }


    const isAlreadyRegistered = await userModel.findOne({
        $or:[{username},{email}]
    })

    if(isAlreadyRegistered){
        return res.status(400).json({
            message:"Account already exist with this username or email"
        })
    }

    const hash = await bcrypt.hash(password,10)

    const user = await userModel.create({
        username,
        email,
        password:hash,
        role
    })

    

    res.status(201).json({
        message:"User registered successfully",
        user:{
            id:user._id,
            username:user.username,
            email:user.email,
            role:user.role
        }
    })
    }catch(err){
        res.status(500).json({
            message:"Internal server error"
        })
    }
}



async function loginUserController(req,res){
    try{
    const {email,password,role}=req.body

    const user = await userModel.findOne({email})
    if(!user){
        return res.status(400).json({
            message:"User does not exists"
        })
    }
    const isPassword = await bcrypt.compare(password,user.password)

    if(!isPassword){
        return res.status(400).json({
            message:"Invalid email or password"
        })
    }
    if(role !== user.role){
        return res.status(400).json({
            message:"Invalid role selected"
        })
    }
    const token = jwt.sign(
        {id:user._id,role:user.role},
        process.env.JWT_SECRET,
        { expiresIn:"1d" }
    )

    res.cookie("token", token, {
    httpOnly: true,
    // secure: false,      // localhost
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
});
    res.status(200).json({
        message:"User loggedIn successfully",
        token,
        user:{
            id:user._id,
            username:user.username,
            email:user.email,
            role:user.role
        }
    })
}catch(err){
    res.status(500).json({
        message:"Internal server error"
    })
}
}


async function logoutUserController(req,res){
        const token = req.cookies.token

        if(token){
            await tokenBlacklistModel.create({token})
        }

        res.clearCookie("token")

        res.status(200).json({
            message:"User logged out successfully"
        })
}


async function getMeController(req,res){
    try{
            const user = await userModel.findById(req.user.id)


            res.status(200).json({
                message:"User details fetched successfully",
                user:{
                    id:user._id,
                    username:user.username,
                    email:user.email,
                    role:user.role
                }
            })
            } catch (err) {
         console.error("getMe error:", err.message);
         res.status(500).json({ message: "Internal server error" });
     }
}
    
const handleChat = async (req, res) => {
    try {
        // const { message } = req.body;


        const { message, employee_id } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        // const pythonResponse = await axios.post('http://127.0.0.1:8000/api/chat', {
        //     message: message
        // });


        const pythonResponse = await axios.post('http://127.0.0.1:8000/api/chat', {
            message: message,
            employee_id: employee_id || ""
        });



      return res.status(200).json({ response: pythonResponse.data.response });

    } catch (error) {
        console.error("Error communicating with Python chatbot:", error.message);
        return res.status(500).json({ error: "Chatbot service is currently unavailable" });
    }
};



import fs from 'fs'; // Ensure standard fs or dynamic import is accessible

const processCandidateResume = async (req, res) => {
    try {
        const { name, email, appliedRole, jobDescription } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Resume PDF file is required.' });
        }

        // FIX: Since using diskStorage, read the file as a stream or buffer from its saved path
        const fileStream = fs.createReadStream(req.file.path);

        const formData = new FormData();
        formData.append('file', fileStream, req.file.filename);
        formData.append('job_description', jobDescription || '');

        // 2. Forward payload to Python FastAPI microservice
        // Essential: Standard Node 'form-data' package needs its headers attached explicitly
        const aiResponse = await axios.post('http://127.0.0.1:8000/api/screen', formData, {
            headers: {
                ...formData.getHeaders() // Injects content-type multi-part boundary flags safely
            }
        });

        const { score, summary, key_matches, missing_skills } = aiResponse.data;

        // 3. Save structured assessment data to MongoDB
        const newCandidate = new candidateModel({
            name,
            email,
            appliedRole,
            score,
            summary,
            keyMatches: key_matches || [],
            missingSkills: missing_skills || []
        });

        await newCandidate.save();

        // OPTIONAL CLEANUP: Remove the file from the "uploads/" folder after parsing is finished
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("⚠️ Failed to clean up temp file:", err.message);
        });

        return res.status(201).json(newCandidate);

    } catch (error) {
        // Detailed logging to isolate if Express or FastAPI broke
        console.error('❌ Screener Pipeline Operational Failure:', error.response?.data || error.message);
        
        const fallbackError = error.response?.data?.detail || error.response?.data?.error || 'Failed to process resume screening asset.';
        return res.status(500).json({ error: fallbackError });
    }
};

const getAllCandidates = async (req, res) => {
    try {
        // Mongoose query will successfully run once server.js triggers connectToDb()
        const candidates = await candidateModel.find().sort({ score: -1 }); 
        return res.status(200).json(candidates);
    } catch (error) {
        console.error('❌ Pipeline Fetch Error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch candidate pipeline records.' });
    }
};


export default {loginUserController ,logoutUserController,getMeController,registerUserController,handleChat,processCandidateResume,getAllCandidates}