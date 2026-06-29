import leaveModel from "../models/leave.model.js";
import userModel from "../models/user.model.js";

// Called by the employee from the form OR by the agent
async function applyLeaveController(req, res) {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;

        // req.user comes from authUser middleware (JWT decoded)
        const user = await userModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ message: "Start date cannot be after end date" });
        }

        // Calculate number of days automatically
        const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = await leaveModel.create({
            employeeId: user._id,
            username: user.username,
            email: user.email,
            leaveType,
            startDate: start,
            endDate: end,
            days,
            reason: reason || ''
        });

        return res.status(201).json({
            message: "Leave applied successfully",
            leave
        });

    } catch (err) {
        console.error("Leave apply error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Called by the agent (no JWT — uses employee_id from body instead)
// This is a separate internal endpoint just for the Python agent
async function applyLeaveInternalController(req, res) {
    try {
        const { employee_id, leaveType, startDate, endDate, reason } = req.body;

        const user = await userModel.findById(employee_id);
        if (!user) {
            return res.status(404).json({ message: "Employee not found" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;

        const leave = await leaveModel.create({
            employeeId: user._id,
            username: user.username,
            email: user.email,
            leaveType,
            startDate: start,
            endDate: end,
            days,
            reason: reason || ''
        });

        return res.status(201).json({
            message: "Leave applied successfully",
            leave
        });

    } catch (err) {
        console.error("Internal leave apply error:", err.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// HR sees all pending requests
async function getAllLeavesController(req, res) {
    try {
        const leaves = await leaveModel.find().sort({ createdAt: -1 });
        return res.status(200).json(leaves);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// Employee sees their own leave history
async function getMyLeavesController(req, res) {
    try {
        const leaves = await leaveModel.find({ employeeId: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json(leaves);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// HR approves or rejects
async function updateLeaveStatusController(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'Approved' or 'Rejected'

        const leave = await leaveModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!leave) {
            return res.status(404).json({ message: "Leave request not found" });
        }

        return res.status(200).json({ message: `Leave ${status}`, leave });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

export default {
    applyLeaveController,
    applyLeaveInternalController,
    getAllLeavesController,
    getMyLeavesController,
    updateLeaveStatusController
};
