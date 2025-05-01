import { APIResponse } from "../../service/core/CustomResponse.js";
import { AdminService } from "../../service/v1/admin.service.js";

export class AdminController {
  /**
   * Handle get user types
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetUserTypes(req, res) {
    try {
      const userTypes = await AdminService.getUserTypes();

      return APIResponse.success(
        res,
        userTypes,
        "User types retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle get all applications
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetAllApplications(req, res) {
    try {
      const { status, page, limit, sortBy, sortOrder } = req.query;

      const applications = await AdminService.getAllApplications({
        status,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sortBy: sortBy || "createdAt",
        sortOrder: sortOrder || "desc",
      });

      return APIResponse.success(
        res,
        applications,
        "Applications retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle get application details
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetApplicationDetails(req, res) {
    try {
      const { applicationId } = req.params;

      const application = await AdminService.getApplicationDetails(
        applicationId
      );

      return APIResponse.success(
        res,
        application,
        "Application details retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle put application status
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handlePutApplicationStatus(req, res) {
    try {
      const { applicationId } = req.params;
      const { status, remarks } = req.body;
      const adminId = req.user.userId;

      const updatedApplication = await AdminService.updateApplicationStatus({
        applicationId,
        status,
        remarks,
        adminId,
      });

      return APIResponse.success(
        res,
        updatedApplication,
        "Application status updated successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle get pass types
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetPassTypes(req, res) {
    try {
      const passTypes = await AdminService.getPassTypes();

      return APIResponse.success(
        res,
        passTypes,
        "Pass types retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle post pass type
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handlePostPassType(req, res) {
    try {
      const { name, duration, price, description, perDayLimit } = req.body;
      const adminId = req.user.userId;

      const passType = await AdminService.createPassType({
        name,
        duration,
        price,
        description,
        perDayLimit,
        adminId,
      });

      return APIResponse.success(
        res,
        passType,
        "Pass type created successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle put pass type
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handlePutPassType(req, res) {
    try {
      const { passTypeId } = req.params;
      const { name, duration, price, description } = req.body;
      const adminId = req.user.userId;

      const updatedPassType = await AdminService.updatePassType({
        passTypeId,
        name,
        duration,
        price,
        description,
        adminId,
      });

      return APIResponse.success(
        res,
        updatedPassType,
        "Pass type updated successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle get statistics
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetStatistics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const statistics = await AdminService.getDashboardStatistics({
        startDate,
        endDate,
      });

      return APIResponse.success(
        res,
        statistics,
        "Statistics retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle get all users
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetAllUsers(req, res) {
    try {
      const users = await AdminService.getAllUsers();

      return APIResponse.success(
        res,
        users,
        "Users retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }
}
