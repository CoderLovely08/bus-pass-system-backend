import { APIResponse } from "../../service/core/CustomResponse.js";
import { SupabaseService } from "../../service/utils/Supabase.service.js";
import { PassengerService } from "../../service/v1/passenger.service.js";
import { generateQRCode } from "../../utils/helpers/app.helpers.js";

export class PassengerController {
  /**
   * Handle post bus pass application
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handlePostBusPassApplication(req, res) {
    try {
      const { passTypeId, documentType } = req.body;
      const userId = req.user.userId;

      if (!req.file) {
        return APIResponse.error(res, "Document is required", 400);
      }

      // return APIResponse.success(res, req.file, "Document uploaded successfully");

      const uploadedDocument = await SupabaseService.supabaseUploadFile(
        req.file.originalname,
        req.file.buffer,
        req.file.mimetype
      );

      if (!uploadedDocument.success) {
        return APIResponse.error(res, uploadedDocument.message, 500);
      }

      const application = await PassengerService.createBusPassApplication({
        userId,
        passTypeId,
        documentLink: uploadedDocument.fileUrl,
        documentType,
      });

      return APIResponse.success(
        res,
        application,
        "Bus pass application submitted successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle get pass details
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetPassDetails(req, res) {
    try {
      const { passId } = req.params;
      const userId = req.user.userId;

      const pass = await PassengerService.getBusPassDetails(passId, userId);

      // Generate QR code for the pass if status is approved
      if (pass.status === "APPROVED") {
        pass.qrCode = await generateQRCode(
          JSON.stringify({
            passId: pass.id,
            userId: pass.userId,
            validFrom: pass.validFrom,
            validTo: pass.validTo,
          })
        );
      }

      return APIResponse.success(
        res,
        pass,
        "Pass details retrieved successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }

  /**
   * Handle get all passes
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handleGetAllPasses(req, res) {
    try {
      const userId = req.user.userId;
      const passes = await PassengerService.getAllPasses(userId);

      return APIResponse.success(
        res,
        passes,
        "All passes retrieved successfully"
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
      const passTypes = await PassengerService.getPassTypes();

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
   * Handle post payment
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @returns {Object} Response object
   */
  static async handlePostPayment(req, res) {
    try {
      const { passId, paymentMethod } = req.body;
      const userId = req.user.userId;

      const payment = await PassengerService.processPayment({
        userId,
        passId,
        paymentMethod,
      });

      return APIResponse.success(
        res,
        payment,
        "Payment processed successfully"
      );
    } catch (error) {
      return APIResponse.error(res, error.message, error.statusCode);
    }
  }
}
