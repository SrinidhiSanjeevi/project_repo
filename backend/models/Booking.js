const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service"
    },
    isCustom: {
      type: Boolean,
      default: false
    },
    customCategory: {
      type: String
    },
    customDescription: {
      type: String
    },
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Professional"
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true // e.g., "09:00 AM - 11:00 AM", "02:00 PM - 04:00 PM"
    },
    address: {
      type: String,
      required: true
    },
    contactNumber: {
      type: String,
      required: true
    },
    notes: {
      type: String,
      default: "" // Allergy notes, entrance instructions, etc.
    },
    selectedProduct: {
      name: String,
      brand: String,
      extraPrice: Number
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Card", "UPI", "Cash"]
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending"
    },
    totalPrice: {
      type: Number,
      required: true
    },
    userRating: {
      type: Number, // 1-5 rating given after service completion
      min: 1,
      max: 5
    },
    userReview: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Booking", bookingSchema);
