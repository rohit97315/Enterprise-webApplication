import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
    username:{
        type:String,
        required:true,
        unique:[true,"username already taken"],
    },
    email:{
        type:String,
        required:true,
        unique:[true,"email already registered"]
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,
        emun:['Admin','HR_Manager','Employee'],
        default:'Employee'
    }
},{timestamps:true})

const userModel = mongoose.model("user",userSchema)

export default userModel