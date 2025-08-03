import express from "express";
import { login, logout, onboard, signup } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/onboarding", protectRoute, onboard);

router.get("/me", protectRoute, (req,res)=>{
    res.status(200).json({success: true, user: req.user});
})
// todo : forget password, password reset

export default router;