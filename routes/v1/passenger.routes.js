import express from "express";
import { validateToken } from "../../middlewares/auth.middleware.js";
import {
  higherOrderUserDataValidation,
  validateRequestParams,
} from "../../middlewares/validation.middleware.js";
import { PassengerController } from "../../controllers/v1/Passenger.controller.js";
import upload from "../../config/multer.config.js";
import { ValidationSchema } from "../../schema/validation.schema.js";

const router = express.Router();

// Passenger Registration & Login routes are handled in auth.routes.js

// Apply for bus pass
router.post(
  "/apply",
  validateToken,
  upload.single("document"),
  higherOrderUserDataValidation(ValidationSchema.passApplicationSchema),
  PassengerController.handlePostBusPassApplication
);

// Get pass details
router.get(
  "/pass/:passId",
  validateToken,
  validateRequestParams(ValidationSchema.passIdSchema),
  PassengerController.handleGetPassDetails
);

// Get all passes for a passenger
router.get("/passes", validateToken, PassengerController.handleGetAllPasses);

// Get pass types and pricing
router.get("/pass-types", PassengerController.handleGetPassTypes);

// Make payment for pass
router.post(
  "/payment",
  validateToken,
  higherOrderUserDataValidation(ValidationSchema.paymentSchema),
  PassengerController.handlePostPayment
);

export default router;
