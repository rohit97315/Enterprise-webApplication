import app from './src/app.js'
import 'dotenv/config'
import connectToDb from './src/config/database.js'


connectToDb()

app.listen(3000,()=>{
    console.log("server running on port 3000")
})