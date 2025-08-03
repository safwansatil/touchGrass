import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protectRoute = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({ message : "Unauthorized - Missing Token"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        if(!decoded){
            return res.status(401).json({ message : "Unauthorized - Invalid Token"});
        }

        const user = await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(401).json({ message : "Unauthorized - User Not Found"});
        }

        req.user = user;

        next();
    } catch (error) {
        console.log("Error in protectRoute middleware: ", error);
        return res.status(500).json({ message : "Internal Server Error"});
    }
}