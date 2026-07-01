const Booking = require("../models/Booking");
const Service = require("../models/Service");
const Professional = require("../models/Professional");
const Razorpay = require("razorpay");
const crypto = require("crypto");

// CREATE NEW BOOKING
const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      professionalId,
      date,
      timeSlot,
      address,
      contactNumber,
      notes,
      selectedProduct,
      paymentMethod,
      paymentDetails,
      totalPrice,
      isCustom,
      customCategory,
      customDescription
    } = req.body;

    const userId = req.user._id;

    let service = null;
    let professional = null;

    if (isCustom) {
      // Find an available professional in the custom category requested
      professional = await Professional.findOne({
        category: customCategory,
        status: "Available"
      });
    } else {
      // Verify service exists
      service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({ success: false, message: "Service not found" });
      }

      // Verify professional exists and belongs to that category
      if (professionalId) {
        professional = await Professional.findById(professionalId);
        if (!professional) {
          return res.status(404).json({ success: false, message: "Selected professional not found" });
        }
      } else {
        // Auto-assign an available professional for this service category
        professional = await Professional.findOne({
          category: service.category,
          status: "Available"
        });
      }
    }

    // Set payment status based on method
    const paymentStatus = (paymentMethod === "Cash") ? "Pending" : "Paid";

    // Set professional to busy if assigned
    if (professional) {
      professional.status = "Busy";
      await professional.save();
    }

    const booking = await Booking.create({
      user: userId,
      service: isCustom ? null : serviceId,
      isCustom: !!isCustom,
      customCategory: customCategory || null,
      customDescription: customDescription || null,
      professional: professional ? professional._id : null,
      date: new Date(date),
      timeSlot,
      address,
      contactNumber,
      notes,
      selectedProduct,
      paymentMethod,
      paymentStatus,
      status: "Confirmed", // Automatically confirm on payment / cash schedule
      totalPrice
    });

    res.status(201).json({
      success: true,
      message: isCustom ? "Custom service request submitted successfully!" : "Booking created successfully",
      booking
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET USER BOOKINGS
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate("service")
      .populate("professional")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.error("GET BOOKINGS ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CANCEL BOOKING
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ _id: id, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status === "Cancelled" || booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: `Booking cannot be cancelled. Current status is ${booking.status}`
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    // Free the professional
    if (booking.professional) {
      const professional = await Professional.findById(booking.professional);
      if (professional) {
        professional.status = "Available";
        await professional.save();
      }
    }

    res.status(200).json({ success: true, message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// RATE AND REVIEW BOOKING
const rateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Invalid rating value (1-5)" });
    }

    const booking = await Booking.findOne({ _id: id, user: userId });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.userRating = rating;
    booking.userReview = review || "";
    booking.status = "Completed"; // Mark service completed when rated
    await booking.save();

    // Update Service average rating
    if (booking.service) {
      const service = await Service.findById(booking.service);
      if (service) {
        const currentTotalRatings = service.rating * service.numRatings;
        const newNumRatings = service.numRatings + 1;
        const newAverageRating = (currentTotalRatings + rating) / newNumRatings;

        service.rating = Math.round(newAverageRating * 10) / 10;
        service.numRatings = newNumRatings;
        await service.save();
      }
    }

    // Update Professional rating and status
    if (booking.professional) {
      const professional = await Professional.findById(booking.professional);
      if (professional) {
        professional.status = "Available"; // Professional becomes available again
        
        // Recalculate professional rating
        const oldRating = professional.rating || 4.8;
        professional.rating = Math.round(((oldRating + rating) / 2) * 10) / 10;
        
        await professional.save();
      }
    }

    res.status(200).json({ success: true, message: "Thank you for your rating!", booking });
  } catch (error) {
    console.error("RATE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE RAZORPAY ORDER
const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if keys are set up. If not, fallback to simulated order ID
    if (!keyId || keyId === "rzp_test_your_key_id" || !keySecret) {
      console.log("Razorpay keys not configured. Falling back to simulated mode.");
      return res.status(200).json({
        success: true,
        isSimulated: true,
        orderId: `order_simulated_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        keyId: "rzp_test_simulated_key"
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      isSimulated: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId
    });
  } catch (error) {
    console.error("RAZORPAY ORDER ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// VERIFY RAZORPAY PAYMENT
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: "Missing payment fields" });
    }

    // Check if it is simulated payment verification
    if (razorpay_order_id.startsWith("order_simulated_")) {
      return res.status(200).json({
        success: true,
        message: "Simulated payment verified successfully!"
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      res.status(200).json({
        success: true,
        message: "Payment verified successfully!"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }
  } catch (error) {
    console.error("RAZORPAY VERIFY ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  cancelBooking,
  rateBooking,
  createRazorpayOrder,
  verifyRazorpayPayment
};
