const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllBookings,
  updateBookingStatus,
  getAllServices,
  getAllProfessionals,
  getAllEmergencies,
} = require("../controllers/adminController");

// All admin routes are protected by both protect + adminOnly middleware

router.get("/stats",          protect, adminOnly, getStats);
router.get("/users",          protect, adminOnly, getAllUsers);
router.delete("/users/:id",   protect, adminOnly, deleteUser);
router.get("/bookings",       protect, adminOnly, getAllBookings);
router.put("/bookings/:id/status", protect, adminOnly, updateBookingStatus);
router.get("/services",       protect, adminOnly, getAllServices);
router.get("/professionals",  protect, adminOnly, getAllProfessionals);
router.get("/emergencies",    protect, adminOnly, getAllEmergencies);

module.exports = router;
