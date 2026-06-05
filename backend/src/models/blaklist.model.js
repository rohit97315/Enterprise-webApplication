import mongoose from "mongoose";

const blacklistSchema = new mongoose.Schema({
    token:{
        type: String,
        required: [ true, "token is required to be added in blacklist" ]
    }
},{
    timestamps:true,
})

const tokenBlacklistModel = mongoose.model("blacklisttokens",blacklistSchema)

export default tokenBlacklistModel