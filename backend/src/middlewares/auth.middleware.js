import jwt from "jsonwebtoken"
import tokenBlacklistModel from "../models/blaklist.model.js"

export async function authUser(req,res,next){
    const token = req.cookies.token

    
    if(!token){
        return res.status(401).json({
            message:"Token not provided"
        })
    }
    const isTokenBlacklisted = await tokenBlacklistModel.findOne({token})

    if(isTokenBlacklisted){
        return res.status(401).json({
            message:"Token is invalid"
        })
    }
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        req.user = decoded

        next()
    }catch (err){
        return res.status(401).json({
            message:"invalid token"
        })
    }
}


export const authorizeRoles = (...allowedRoles) => {
    return (req,res,next) => {
        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                message:"Forbidden: You don't have permission to access this resource"
            })
        }
        next();
    }
}

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access Denied: No Token Provided' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Contains id and role
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
};

