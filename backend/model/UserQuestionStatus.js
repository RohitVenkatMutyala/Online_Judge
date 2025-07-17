const mongoose = require("mongoose");

const userQuestionStatusSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true },
    question: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Question", 
        required: true },
    status: {
        type: String,
        enum: ["Unsolved", "Solved", "Attempted", "In Progress"],
        default: "Unsolved",
    },
}, { timestamps: true });

module.exports = mongoose.model("UserQuestionStatus", userQuestionStatusSchema);
