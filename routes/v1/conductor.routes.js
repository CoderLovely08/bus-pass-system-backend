import express from "express";
import { validateToken, checkRole } from "../../middlewares/auth.middleware.js";
import { higherOrderUserDataValidation } from "../../middlewares/validation.middleware.js";
import {
  USER_TYPES,
  VALIDATION_TYPES,
} from "../../utils/constants/app.constant.js";
import { ConductorController } from "../../controllers/v1/Conductor.controller.js";

const router = express.Router();

// Verify pass by pass number
router.post(
  "/verify-pass",
  validateToken,
  checkRole([USER_TYPES.CONDUCTOR]),
  higherOrderUserDataValidation([
    {
      field: "passNumber",
      type: VALIDATION_TYPES.STRING,
      required: true,
    },
    {
      field: "scanMethod",
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
  checkRole([USER_TYPES.CONDUCTOR]),
  ConductorController.handleGetVerificationHistory
);

export default router;
