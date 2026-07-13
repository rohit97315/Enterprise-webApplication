import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth.routes.js'
import leaveRouter from './routes/leave.routes.js'
import hrAgentRouter from './routes/hr.agent.routes.js'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials:true
}))

app.use("/api/auth",authRouter)
app.use("/api/leave", leaveRouter) 
app.use("/api/hr-agent", hrAgentRouter)    


export default app