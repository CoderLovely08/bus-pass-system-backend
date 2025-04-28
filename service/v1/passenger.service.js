import { prisma } from "../../app.js";
import { CustomError } from "../core/CustomResponse.js";
import { generateRandomString } from "../../utils/helpers/app.helpers.js";
import { PAYMENT_STATUS } from "../../utils/constants/app.constant.js";

export class PassengerService {
  /**
   * Create bus pass application
   * @param {Object} params - Parameters
   * @param {string} params.userId - User ID
   * @param {string} params.passType - Pass type
   * @param {string} params.documentLink - Document link
   * @param {string} params.documentType - Document type
   * @returns {Promise<Object>} Created application
   */
  static async createBusPassApplication({
    userId,
    passTypeId,
    documentLink,
    documentType,
  }) {
    try {
      // Check if user exists
      const user = await prisma.systemUsersInfo.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new CustomError("User not found", 404);
      }

      // Check if pass type exists
      const passTypeDetails = await prisma.passType.findUnique({
        where: { id: passTypeId },
      });

      if (!passTypeDetails) {
        throw new CustomError("Invalid pass type", 400);
      }

      // Check if user has any pending applications
      const pendingApplication = await prisma.passApplication.findFirst({
        where: {
          userId,
          status: "PENDING",
        },
      });

      if (pendingApplication) {
        throw new CustomError("You already have a pending application", 400);
      }

      // Create application with transaction to handle documents
      return await prisma.$transaction(async (prisma) => {
        // Create application
        const application = await prisma.passApplication.create({
          data: {
            userId,
            passTypeId,
            status: "PENDING",
            paymentStatus: "PENDING",
            documents: {
              create: {
                documentType: documentType,
                documentPath: documentLink,
              },
            },
          },
          include: {
            passType: true,
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        });

        return application;
      });
    } catch (error) {
      throw new CustomError(
        error.message || "Error creating application",
        error.statusCode || 500
      );
    }
  }

  /**
   * Get bus pass details
   * @param {string} passId - Pass ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Pass details
   */
  static async getBusPassDetails(passId, userId) {
    try {
      const pass = await prisma.busPass.findUnique({
        where: { id: passId },
        include: {
          application: {
            include: {
              passType: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!pass) {
        throw new CustomError("Pass not found", 404);
      }

      if (pass.application.userId !== userId) {
        throw new CustomError("Unauthorized access", 403);
      }

      return pass;
    } catch (error) {
      throw new CustomError(
        error.message || "Error fetching pass details",
        error.statusCode || 500
      );
    }
  }

  /**
   * Get all passes for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of passes
   */
  static async getAllPasses(userId) {
    try {
      const passes = await prisma.passApplication.findMany({
        where: {
          userId: userId,
        },
        include: {
          passType: true,
          payments: true,
          documents: true,
          approvals: true,
          busPass: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return passes;
    } catch (error) {
      throw new CustomError(
        error.message || "Error fetching passes",
        error.statusCode || 500
      );
    }
  }

  /**
   * Get pass types
   * @returns {Promise<Array>} List of pass types
   */
  static async getPassTypes() {
    try {
      const passTypes = await prisma.passType.findMany({
        where: { isActive: true },
        orderBy: {
          price: "asc",
        },
      });

      return passTypes;
    } catch (error) {
      throw new CustomError(
        error.message || "Error fetching pass types",
        error.statusCode || 500
      );
    }
  }

  /**
   * Process payment
   * @param {Object} params - Parameters
   * @param {string} params.userId - User ID
   * @param {string} params.passId - Pass ID
   * @param {string} params.paymentMethod - Payment method
   * @param {number} params.amount - Amount
   * @returns {Promise<Object>} Payment details
   */
  static async processPayment({ userId, passId, paymentMethod, amount }) {
    try {
      return await prisma.$transaction(async (prisma) => {
        const busPass = await prisma.passApplication.findUnique({
          where: { id: passId },
          include: {
            passType: true,
            payments: true,
            documents: true,
            approvals: true,
            busPass: {
              include: {
                application: {
                  include: {
                    passType: true,
                  },
                },
              },
            },
          },
        });

        console.log(busPass);

        if (!busPass) {
          throw new CustomError("Pass not found", 404);
        }

        if (busPass.paymentStatus !== "PENDING") {
          throw new CustomError("Payment already processed", 400);
        }

        // Create payment record
        const payment = await prisma.payment.create({
          data: {
            application: {
              connect: {
                id: busPass.id,
              },
            },
            amount: busPass.passType.price,
            paymentMethod,
            status: "COMPLETED",
            transactionId: generateRandomString(6),
            paidAt: new Date(),
          },
        });

        // Update application payment status
        await prisma.passApplication.update({
          where: { id: busPass.id },
          data: {
            paymentStatus: PAYMENT_STATUS.COMPLETED,
          },
        });

        return payment;
      });
    } catch (error) {
      throw new CustomError(
        error.message || "Error processing payment",
        error.statusCode || 500
      );
    }
  }
}
