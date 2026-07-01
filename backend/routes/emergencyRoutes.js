const express = require("express");
const router = express.Router();
const { dispatchEmergency, getActiveEmergencies } = require("../controllers/emergencyController");
const { protect } = require("../middleware/authMiddleware");

// PROTECTED ROUTES
router.use(protect);

router.post("/dispatch", dispatchEmergency);
router.get("/active", getActiveEmergencies);

module.exports = router;
