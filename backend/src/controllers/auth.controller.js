import userModel from "../models/user.model.js";
import tokenBlacklistModel from "../models/blaklist.model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import axios from 'axios'


async function registerUserController(req,res){
    try{
    const {username,email,password,role} = req.body

    if(!username || !email || !password){
        return res.status(400).json({
            message:"Please provide username ,email, password"
        })
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

    const user = userModel.create({
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
        res.status(400).json({
            message:"User does not exists"
        })
    }
    const isPassword = await bcrypt.compare(password,user.password)

    if(!isPassword){
        res.status(400).json({
            message:"Invalid email or password"
        })
    }
    if(role !== user.role){
        res.status(400).json({
            message:"Invalid role selected"
        })
    }
    const token = jwt.sign(
        {id:user._id,role:user.role},
        process.env.JWT_SECRET,
        { expiresIn:"1d" }
    )

    res.cookie("token",token)
    res.status(200).json({
        message:"User loggedIn successfully",
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
}
    
const handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const pythonResponse = await axios.post('http://127.0.0.1:8000/api/chat', {
            message: message
        });

      return res.status(200).json({ response: pythonResponse.data.response });

    } catch (error) {
        console.error("Error communicating with Python chatbot:", error.message);
        return res.status(500).json({ error: "Chatbot service is currently unavailable" });
    }
};


export default {loginUserController ,logoutUserController,getMeController,registerUserController,handleChat}