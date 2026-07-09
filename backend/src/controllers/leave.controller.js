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

//more mcp tools apis
// ── Tool: search by employee name ──────────────────────────────────────────
async function getLeavesByUsernameController(req, res) {
    try {
        const { username } = req.query;
        if (!username) return res.status(400).json({ message: "username query required" });

        const leaves = await leaveModel.find({
            username: { $regex: username, $options: "i" }
        }).sort({ createdAt: -1 });

        if (leaves.length === 0)
            return res.status(404).json({ message: `No leaves found for "${username}"` });

        const summary = {
            totalLeaves: leaves.length,
            totalDays:   leaves.reduce((s, l) => s + l.days, 0),
            byType:      {},
            byStatus:    { Pending: 0, Approved: 0, Rejected: 0 }
        };
        leaves.forEach(l => {
            summary.byType[l.leaveType] = (summary.byType[l.leaveType] || 0) + 1;
            summary.byStatus[l.status]++;
        });

        return res.status(200).json({ leaves, summary });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ── Tool: rank employees by leave count ────────────────────────────────────
async function getLeaveRankingController(req, res) {
    try {
        const { month, year } = req.query;
        let matchStage = {};

        if (month && year) {
            matchStage = {
                startDate: {
                    $gte: new Date(year, month - 1, 1),
                    $lte: new Date(year, month, 0)
                }
            };
        }

        const ranking = await leaveModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id:          "$username",
                    email:        { $first: "$email" },
                    totalLeaves:  { $sum: 1 },
                    totalDays:    { $sum: "$days" },
                    sickLeaves:   { $sum: { $cond: [{ $eq: ["$leaveType", "Sick Leave"]   }, 1, 0] } },
                    annualLeaves: { $sum: { $cond: [{ $eq: ["$leaveType", "Annual Leave"] }, 1, 0] } }
                }
            },
            { $sort: { totalDays: -1 } }
        ]);

        return res.status(200).json(ranking);
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ── Tool: who is on leave today ────────────────────────────────────────────
async function getCurrentlyOnLeaveController(req, res) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const onLeave = await leaveModel.find({
            status:    "Approved",
            startDate: { $lte: today },
            endDate:   { $gte: today }
        });

        return res.status(200).json({ count: onLeave.length, employees: onLeave });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ── Tool: bulk approve / reject for one employee ───────────────────────────
async function bulkUpdateLeavesByUsernameController(req, res) {
    try {
        const { username, status } = req.body;
        if (!username || !status)
            return res.status(400).json({ message: "username and status required" });

        const result = await leaveModel.updateMany(
            { username: { $regex: username, $options: "i" }, status: "Pending" },
            { $set: { status } }
        );

        return res.status(200).json({
            message:       `${result.modifiedCount} leave(s) ${status} for ${username}`,
            modifiedCount: result.modifiedCount
        });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ── Tool: flag high absenteeism ────────────────────────────────────────────
async function getHighAbsenteeismController(req, res) {
    try {
        const threshold = parseInt(req.query.threshold) || 5;

        const flagged = await leaveModel.aggregate([
            {
                $group: {
                    _id:         "$username",
                    email:       { $first: "$email" },
                    totalLeaves: { $sum: 1 },
                    totalDays:   { $sum: "$days" }
                }
            },
            { $match: { totalLeaves: { $gte: threshold } } },
            { $sort: { totalLeaves: -1 } }
        ]);

        return res.status(200).json({ threshold, flaggedCount: flagged.length, employees: flagged });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ── Tool: auto-process leaves by HR rules ─────────────────────────────────
async function autoProcessLeavesByRuleController(req, res) {
    try {
        const { action, leave_type, max_days, min_days, blackout_start, blackout_end } = req.body;

        if (!action || !['Approved', 'Rejected'].includes(action))
            return res.status(400).json({ message: "action must be 'Approved' or 'Rejected'" });

        let query = { status: "Pending" };

        if (leave_type)   query.leaveType = leave_type;
        if (max_days)     query.days = { ...query.days, $lte: parseInt(max_days) };
        if (min_days)     query.days = { ...query.days, $gte: parseInt(min_days) };

        if (blackout_start && blackout_end) {
            query.startDate = { $lte: new Date(blackout_end) };
            query.endDate   = { $gte: new Date(blackout_start) };
        }

        const matching = await leaveModel.find(query);

        if (matching.length === 0)
            return res.status(200).json({ message: "No pending leaves matched the rule.", processedCount: 0, processed: [] });

        await leaveModel.updateMany(
            { _id: { $in: matching.map(l => l._id) } },
            { $set: { status: action } }
        );

        const processed = matching.map(l => ({
            username:  l.username,
            leaveType: l.leaveType,
            startDate: l.startDate.toISOString().slice(0, 10),
            endDate:   l.endDate.toISOString().slice(0, 10),
            days:      l.days,
            newStatus: action
        }));

        return res.status(200).json({
            message:        `${matching.length} leave(s) automatically ${action}`,
            processedCount: matching.length,
            processed
        });
    } catch (err) {
        return res.status(500).json({ message: "Internal server error" });
    }
}



export default {
    applyLeaveController,
    applyLeaveInternalController,
    getAllLeavesController,
    getMyLeavesController,
    updateLeaveStatusController,
    getLeavesByUsernameController,
    getLeaveRankingController,
    getCurrentlyOnLeaveController,
    bulkUpdateLeavesByUsernameController,
    getHighAbsenteeismController,
    autoProcessLeavesByRuleController
};
