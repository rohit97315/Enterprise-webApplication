import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    username: {
        type: String,
        ref:'user',
        required: true
    },
    email: {
        type: String,
        ref:'user',
        required: true
    },
    leaveType: {
        type: String,
        required: true,
        enum: ['Sick Leave', 'Annual Leave', 'Casual Leave']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
}, { timestamps: true });

const leaveModel = mongoose.model("Leave", leaveSchema);
export default leaveModel;