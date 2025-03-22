import express from "express";
import { validateToken, checkRole } from "../../middlewares/auth.middleware.js";
import { higherOrderUserDataValidation } from "../../middlewares/validation.middleware.js";
import { VALIDATION_TYPES } from "../../utils/constants/app.constant.js";
import { ConductorController } from "../../controllers/v1/Conductor.controller.js";

const router = express.Router();

// Verify pass by QR code
router.post(
  "/verify-qr",
  validateToken,
  checkRole(["CONDUCTOR"]),
  higherOrderUserDataValidation([
    {
      field: "qrData",
      type: VALIDATION_TYPES.STRING,
      required: true,
    },
  ]),
  ConductorController.handlePostVerifyQR
);

// Verify pass by pass number
router.post(
  "/verify-pass",
  validateToken,
  checkRole(["CONDUCTOR"]),
  higherOrderUserDataValidation([
    {
      field: "passNumber",
      type: VALIDATION_TYPES.STRING,
      required: true,
    },
  ]),
  ConductorController.handlePostVerifyPassNumber
);

// Get verification history
router.get(
  "/verifications",
  validateToken,
  checkRole(["CONDUCTOR"]),
  ConductorController.handleGetVerificationHistory
);

export default router; 