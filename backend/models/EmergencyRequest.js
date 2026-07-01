const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Electrical", "Plumbing", "Security"]
    },
    description: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ["Dispatched", "Resolved", "Cancelled"],
      default: "Dispatched"
    },
    assignedProfessional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EmergencyRequest", emergencyRequestSchema);
