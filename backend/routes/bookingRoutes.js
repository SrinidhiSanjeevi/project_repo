const express = require("express");
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  cancelBooking,
  rateBooking,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// PROTECTED ROUTES
router.use(protect);

router.post("/", createBooking);
router.get("/", getUserBookings);
router.put("/:id/cancel", cancelBooking);
router.put("/:id/rate", rateBooking);
router.post("/razorpay-order", createRazorpayOrder);
router.post("/razorpay-verify", verifyRazorpayPayment);

module.exports = router;
