import app from './src/app.js'
import 'dotenv/config'
import connectToDb from './src/config/database.js'


connectToDb()

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
     console.log(`server running on port ${PORT}`)
  })