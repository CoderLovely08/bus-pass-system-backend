import { APIResponse } from "../../service/core/CustomResponse.js";
import { ConductorService } from "../../service/v1/conductor.service.js";

export class ConductorController {

  /**
   * Handle get dashboard
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetDashboard(req, res) {
    try {
      const conductorId = req.user.userId;

      const dashboard = await ConductorService.getDashboard(conductorId);

      return APIResponse.success(
        res,
        dashboard,
        "Dashboard retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle post verify pass number
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handlePostVerifyPassNumber(req, res) {
    try {
      const { passNumber, scanMethod } = req.body;
      const conductorId = req.user.userId;

      const verificationResult = await ConductorService.verifyPassByNumber({
        passNumber,
        conductorId,
        scanMethod,
      });

      return APIResponse.success(
        res,
        verificationResult,
        "Pass verification completed"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle get verification history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetVerificationHistory(req, res) {
    try {
      const conductorId = req.user.userId;
      const { page, limit, startDate, endDate } = req.query;

      const history = await ConductorService.getVerificationHistory({
        conductorId,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        startDate,
        endDate,
      });

      return APIResponse.success(
        res,
        history,
        "Verification history retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }
}
