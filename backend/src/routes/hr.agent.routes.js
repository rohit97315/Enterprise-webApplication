import { Router } from "express";
import { authUser, authorizeRoles } from "../middlewares/auth.middleware.js";
import hrAgentController from "../controllers/hr.agent.controller.js";

const hrAgentRouter = Router();

hrAgentRouter.post(
    "/chat",
    authUser,
    authorizeRoles("HR_Manager", "Admin"),
    hrAgentController.handleHRAgentChat
);

export default hrAgentRouter;