const EmergencyRequest = require("../models/EmergencyRequest");
const Professional = require("../models/Professional");

// DISPATCH EMERGENCY SERVICE
const dispatchEmergency = async (req, res) => {
  try {
    const { category, description, contactNumber, address } = req.body;
    const userId = req.user._id;

    if (!category || !["Electrical", "Plumbing", "Security"].includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid emergency category. Must be Electrical, Plumbing, or Security."
      });
    }

    // Find the highest rated available professional for this category
    const professional = await Professional.findOne({
      category,
      status: "Available"
    }).sort({ rating: -1 });

    if (professional) {
      professional.status = "Busy";
      await professional.save();
    }

    const emergency = await EmergencyRequest.create({
      user: userId,
      category,
      description,
      contactNumber,
      address,
      status: "Dispatched",
      assignedProfessional: professional ? professional._id : null
    });

    // Populate professional info for response
    const populatedEmergency = await EmergencyRequest.findById(emergency._id).populate(
      "assignedProfessional"
    );

    res.status(201).json({
      success: true,
      message: professional
        ? `Emergency dispatched! Assigned provider: ${professional.name}`
        : "Emergency requested! Searching for an available nearby provider...",
      emergency: populatedEmergency
    });
  } catch (error) {
    console.error("EMERGENCY DISPATCH ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET ACTIVE EMERGENCIES FOR USER
const getActiveEmergencies = async (req, res) => {
  try {
    const userId = req.user._id;
    const emergencies = await EmergencyRequest.find({
      user: userId,
      status: "Dispatched"
    })
      .populate("assignedProfessional")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, emergencies });
  } catch (error) {
    console.error("GET EMERGENCIES ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  dispatchEmergency,
  getActiveEmergencies
};
