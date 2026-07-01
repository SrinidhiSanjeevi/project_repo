const mongoose = require("mongoose");

const professionalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ["Spa", "Electrician", "Carpentry", "Plumbing", "Security", "Repair"]
    },
    rating: {
      type: Number,
      default: 4.8
    },
    experience: {
      type: Number,
      required: true // Years of experience
    },
    image: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Available", "Busy"],
      default: "Available"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Professional", professionalSchema);
