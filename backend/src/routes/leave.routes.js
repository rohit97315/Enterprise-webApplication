import { Router } from "express";
import leaveController from "../controllers/leave.controller.js";
import { authUser, authorizeRoles, verifyToken } from "../middlewares/auth.middleware.js";

const leaveRouter = Router();

// Employee applies leave (with JWT auth)
leaveRouter.post("/apply", authUser, leaveController.applyLeaveController);

// Agent applies leave on behalf of employee (no JWT — internal use only)
leaveRouter.post("/apply-internal", leaveController.applyLeaveInternalController);

leaveRouter.get("/all-internal", leaveController.getAllLeavesController);

// Employee sees their own leave history
leaveRouter.get("/my-leaves", authUser, leaveController.getMyLeavesController);

// HR sees all leaves
leaveRouter.get("/all", authUser, authorizeRoles("HR_Manager", "Admin"), leaveController.getAllLeavesController);

// HR approves or rejects
leaveRouter.patch("/:id/status", authUser, authorizeRoles("HR_Manager", "Admin"), leaveController.updateLeaveStatusController);




leaveRouter.get("/search",           leaveController.getLeavesByUsernameController);
leaveRouter.get("/ranking",          leaveController.getLeaveRankingController);
leaveRouter.get("/on-leave-today",   leaveController.getCurrentlyOnLeaveController);
leaveRouter.post("/bulk-update",     leaveController.bulkUpdateLeavesByUsernameController);
leaveRouter.get("/high-absenteeism", leaveController.getHighAbsenteeismController);
leaveRouter.post("/auto-process",    leaveController.autoProcessLeavesByRuleController);

export default leaveRouter;