import { Router } from "express";
import { AuthController } from "../../controllers/v1/Auth.controller.js";
import { higherOrderUserDataValidation } from "../../middlewares/validation.middleware.js";
import { ValidationSchema } from "../../schema/validation.schema.js";
import { USER_TYPES } from "../../utils/constants/app.constant.js";
import { checkRole, validateToken } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * Handle post system user login
 * Route: /api/v1/auth/system/login
 * body: {
 *  email: string,
 *  password: string
 * }
 */
router.post(
  "/system/login",
  higherOrderUserDataValidation(ValidationSchema.loginSchema),
  AuthController.handlePostSystemUserLogin
);

/**
 * Handle post system user registration
 * Route: /api/v1/auth/system/register
 * body: {
 *  email: string,
 *  password: string,
 *  fullName: string
 * }
 */
router.post(
  "/system/register",
  higherOrderUserDataValidation(ValidationSchema.simpleUserOnboardingSchema),
  AuthController.handlePostSystemUserRegistration
);

router.post(
  "/conductor/register",
  validateToken,
  checkRole([USER_TYPES.ADMIN]),
  higherOrderUserDataValidation(ValidationSchema.simpleUserOnboardingSchema),
  AuthController.handlePostSystemUserRegistration
);

export default router;
