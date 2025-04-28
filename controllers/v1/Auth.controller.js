import config from "../../config/app.config.js";
import { APIResponse } from "../../service/core/CustomResponse.js";
import { AuthService } from "../../service/v1/auth.service.js";
import { TOKEN_TYPES } from "../../utils/constants/app.constant.js";
import {
  comparePassword,
  generateJwtToken,
  hashPassword,
} from "../../utils/helpers/app.helpers.js";
import crypto from "crypto";

export class AuthController {
  /**
   * Setup credentials
   * @description Setup credentials for the user and set the cookies for the user
   * @param {Object} res - The response object
   * @param {Object} payload - The payload object
   * @returns {Object} The response object
   */
  static setupCredentials(res, payload) {
    const refreshToken = generateJwtToken(payload, TOKEN_TYPES.REFRESH);
    const accessToken = generateJwtToken(payload, TOKEN_TYPES.ACCESS);

    // await AuthService.createUserSession(payload.id, refreshToken);

    res.cookie(TOKEN_TYPES.REFRESH, refreshToken, {
      maxAge: config.COOKIE.REFRESH_MAX_AGE,
      httpOnly: true,
      sameSite: config.COOKIE.SAME_SITE,
      secure: config.SECURE_COOKIE,
    });

    res.cookie(TOKEN_TYPES.ACCESS, accessToken, {
      maxAge: config.COOKIE.ACCESS_MAX_AGE,
      httpOnly: true,
      sameSite: config.COOKIE.SAME_SITE,
      secure: config.SECURE_COOKIE,
    });

    return res;
  }

  // ------------------------------------------------------------
  // System User Onboarding
  // ------------------------------------------------------------

  /**
   * Handle post system user login
   * @description Handle post system user login
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} The response object
   */
  static async handlePostSystemUserLogin(req, res) {
    try {
      const { email, password } = req.body;

      const user = await AuthService.validateSystemUser(email, password);

      AuthController.setupCredentials(res, {
        userId: user.id,
        email: user.email,
        userName: user.fullName,
        userType: user.userType.name,
      });

      return APIResponse.success(res, user, "User logged in successfully");
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle post system user registration
   * @description Handle post system user registration
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} The response object
   */
  static async handlePostSystemUserRegistration(req, res) {
    try {
      const { email, password, fullName, userType } = req.body;

      const user = await AuthService.createSystemUser(
        email,
        password,
        fullName,
        userType
      );

      return APIResponse.success(res, user, "User registered successfully");
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  // ------------------------------------------------------------
  // Reset Password
  // ------------------------------------------------------------

  /**
   * Handle post request reset parent password
   * @description Handle post request reset parent password
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} The response object
   */
  static async handlePostRequestResetParentPassword(req, res) {
    try {
      const { email } = req.body;

      // Generate a random reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = hashPassword(resetToken);

      // Update the reset token in the db
      const updatedUser = await AuthService.authUpdateResetToken(
        email,
        tokenHash
      );

      // Send the reset password email
      const resetUrl = `${config.WEB_URL}/reset-password?token=${resetToken}&email=${email}`;

      const payload = {
        fullName: updatedUser?.fullName,
        email: updatedUser?.email,
        resetUrl,
      };

      EmailService.sendResetPasswordEmail(payload);

      return APIResponse.success(
        res,
        null,
        "Reset password email sent successfully"
      );
    } catch (error) {
      console.error(`Error in handlePostForgotPassword: ${error.message}`);
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  // ----------------------------------------------------------
  // Update User Password
  // ----------------------------------------------------------

  /**
   * Handle post update user password
   * @description Handle post update user password
   * @param {Object} req - The request object
   * @param {Object} res - The response object
   * @returns {Object} The response object
   */
  static async handlePostUpdateUserPassword(req, res) {
    try {
      const { password, confirmPassword, token, email } = req.body;

      if (password !== confirmPassword) {
        return APIResponse.error(res, "Passwords do not match", 400);
      }

      const emailExists = await AuthService.authCheckIfEmailExists(email);

      // Check if the reset token is valid
      const isTokenValild = await comparePassword(
        token,
        emailExists.resetToken
      );

      if (!isTokenValild) {
        return APIResponse.error(res, "Invalid token", 400);
      }

      // Check if the token is expired
      const tokenSignDate = new Date(emailExists.resetExpiry);
      const currentDate = new Date();

      if (currentDate > tokenSignDate) {
        return APIResponse.error(res, "Token expired", 400);
      }

      await AuthService.authUpdateUserPassword(email, password);

      return APIResponse.success(res, null, "Password updated successfully");
    } catch (error) {
      console.error(`Error in handleResetUserPassword: ${error.message}`);
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }
}
