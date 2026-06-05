import mongoose from "mongoose";

async function connectToDb(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("connected to DB")
    }catch(err){
        console.log(err)
    }
}

export default connectToDb
