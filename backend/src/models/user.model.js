import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false
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
        enum:['Admin','HR_Manager','Employee'],
        default:'Employee'
    }
},{timestamps:true})

userSchema.pre('save', function (next) {
     if (!this.employeeId) {
         this.employeeId = this._id;
     }
     next();
 });

const userModel = mongoose.model("user",userSchema)

export default userModel