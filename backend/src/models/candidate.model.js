import mongoose from "mongoose";
const CandidateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    appliedRole: { type: String, required: true },
    score: { type: Number, required: true },
    summary: { type: String },
    keyMatches: [{ type: String }],
    missingSkills: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const candidateModel = mongoose.model('Candidate', CandidateSchema);
export default candidateModel