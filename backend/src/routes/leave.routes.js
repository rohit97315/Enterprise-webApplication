import { Router } from "express";
import leaveController from "../controllers/leave.controller.js";
import { authUser, authorizeRoles, verifyToken ,verifyInternalKey} from "../middlewares/auth.middleware.js";

const leaveRouter = Router();

// Employee applies leave (with JWT auth)
leaveRouter.post("/apply", authUser, leaveController.applyLeaveController);

// Agent applies leave on behalf of employee (no JWT — internal use only)
leaveRouter.post("/apply-internal",verifyInternalKey, leaveController.applyLeaveInternalController);

leaveRouter.get("/all-internal", verifyInternalKey,leaveController.getAllLeavesController);

// Employee sees their own leave history
leaveRouter.get("/my-leaves", authUser, leaveController.getMyLeavesController);

// HR sees all leaves
leaveRouter.get("/all", authUser, authorizeRoles("HR_Manager", "Admin"), leaveController.getAllLeavesController);

// HR approves or rejects
leaveRouter.patch("/:id/status", authUser, authorizeRoles("HR_Manager", "Admin"), leaveController.updateLeaveStatusController);




leaveRouter.get("/search",  verifyInternalKey,         leaveController.getLeavesByUsernameController);
leaveRouter.get("/ranking",    verifyInternalKey,      leaveController.getLeaveRankingController);
leaveRouter.get("/on-leave-today", verifyInternalKey,  leaveController.getCurrentlyOnLeaveController);
leaveRouter.post("/bulk-update",   verifyInternalKey,  leaveController.bulkUpdateLeavesByUsernameController);
leaveRouter.get("/high-absenteeism", verifyInternalKey,   leaveController.getHighAbsenteeismController);
leaveRouter.post("/auto-process",  verifyInternalKey,  leaveController.autoProcessLeavesByRuleController);

export default leaveRouter;