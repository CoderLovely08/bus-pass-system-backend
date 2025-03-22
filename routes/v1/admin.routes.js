import express from "express";
import { validateToken, checkRole } from "../../middlewares/auth.middleware.js";
import {
  higherOrderUserDataValidation,
  validateRequestParams,
} from "../../middlewares/validation.middleware.js";
import {
  USER_TYPES,
  VALIDATION_TYPES,
} from "../../utils/constants/app.constant.js";
import { AdminController } from "../../controllers/v1/Admin.controller.js";

const router = express.Router();

// Get all pass applications with filters
router.get(
  "/applications",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  AdminController.handleGetAllApplications
);

// Get specific application details
router.get(
  "/applications/:applicationId",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  validateRequestParams([
    {
      field: "applicationId",
      type: VALIDATION_TYPES.INTEGER,
      required: true,
    },
  ]),
  AdminController.handleGetApplicationDetails
);

// Update application status
router.put(
  "/applications/:applicationId",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  higherOrderUserDataValidation([
    {
      field: "status",
      type: VALIDATION_TYPES.STRING,
      required: true,
    },
    {
      field: "remarks",
      type: VALIDATION_TYPES.STRING,
      required: false,
    },
  ]),
  validateRequestParams([
    {
      field: "applicationId",
      type: VALIDATION_TYPES.INTEGER,
      required: true,
    },
  ]),
  AdminController.handlePutApplicationStatus
);

// Manage pass types
router.get(
  "/pass-types",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  AdminController.handleGetPassTypes
);

router.post(
  "/pass-types",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  higherOrderUserDataValidation([
    {
      field: "name",
      type: VALIDATION_TYPES.STRING,
      required: true,
    },
    {
      field: "duration",
      type: VALIDATION_TYPES.INTEGER,
      required: true,
    },
    {
      field: "price",
      type: VALIDATION_TYPES.NUMBER,
      required: true,
    },
    {
      field: "description",
      type: VALIDATION_TYPES.STRING,
      required: false,
    },
  ]),
  AdminController.handlePostPassType
);

router.put(
  "/pass-types/:passTypeId",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  higherOrderUserDataValidation([
    {
      field: "name",
      type: VALIDATION_TYPES.STRING,
      required: false,
    },
    {
      field: "duration",
      type: VALIDATION_TYPES.INTEGER,
      required: false,
    },
    {
      field: "price",
      type: VALIDATION_TYPES.NUMBER,
      required: false,
    },
    {
      field: "description",
      type: VALIDATION_TYPES.STRING,
      required: false,
    },
  ]),
  AdminController.handlePutPassType
);

// Dashboard statistics
router.get(
  "/statistics",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  AdminController.handleGetStatistics
);

// Get user types
router.get(
  "/user-types",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  AdminController.handleGetUserTypes
);

export default router;
