import { prisma } from "../../app.js";
import { CustomError } from "../core/CustomResponse.js";

export class ConductorService {
  /**
   * Verify pass by QR code
   * @param {Object} params - Parameters
   * @param {string} params.qrData - QR code data
   * @param {string} params.conductorId - Conductor ID
   * @returns {Promise<Object>} Verification result
   */
  static async verifyPassByQR({ qrData, conductorId }) {
    try {
      const { passId, userId, validFrom, validTo } = JSON.parse(qrData);

      const pass = await prisma.passes.findUnique({
        where: { id: passId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          passType: true,
        },
      });

      if (!pass) {
        throw new CustomError("Pass not found", 404);
      }

      if (pass.userId !== userId) {
        throw new CustomError("Invalid pass", 400);
      }

      const now = new Date();
      const isExpired = now > new Date(validTo);
      const isNotStarted = now < new Date(validFrom);

      // Create verification record
      const verification = await prisma.passVerifications.create({
        data: {
          passId,
          conductorId,
          verificationMethod: "QR",
          isValid: !isExpired && !isNotStarted && pass.status === "ACTIVE",
          remarks: isExpired
            ? "Pass has expired"
            : isNotStarted
            ? "Pass validity not started"
            : pass.status !== "ACTIVE"
            ? "Pass is not active"
            : "Pass is valid",
        },
        include: {
          pass: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
              passType: true,
            },
          },
        },
      });

      return verification;
    } catch (error) {
      throw new CustomError(
        error.message || "Error verifying pass",
        error.statusCode || 500
      );
    }
  }

  /**
   * Verify pass by pass number
   * @param {Object} params - Parameters
   * @param {string} params.passNumber - Pass number
   * @param {string} params.conductorId - Conductor ID
   * @returns {Promise<Object>} Verification result
   */
  static async verifyPassByNumber({ passNumber, conductorId }) {
    try {
      const pass = await prisma.passes.findUnique({
        where: { passNumber },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          passType: true,
        },
      });

      if (!pass) {
        throw new CustomError("Pass not found", 404);
      }

      const now = new Date();
      const isExpired = now > pass.validTo;
      const isNotStarted = now < pass.validFrom;

      // Create verification record
      const verification = await prisma.passVerifications.create({
        data: {
          passId: pass.id,
          conductorId,
          verificationMethod: "MANUAL",
          isValid: !isExpired && !isNotStarted && pass.status === "ACTIVE",
          remarks: isExpired
            ? "Pass has expired"
            : isNotStarted
            ? "Pass validity not started"
            : pass.status !== "ACTIVE"
            ? "Pass is not active"
            : "Pass is valid",
        },
        include: {
          pass: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                },
              },
              passType: true,
            },
          },
        },
      });

      return verification;
    } catch (error) {
      throw new CustomError(
        error.message || "Error verifying pass",
        error.statusCode || 500
      );
    }
  }

  /**
   * Get verification history
   * @param {Object} params - Parameters
   * @param {string} params.conductorId - Conductor ID
   * @param {number} params.page - Page number
   * @param {number} params.limit - Page limit
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @returns {Promise<Object>} Verification history with pagination
   */
  static async getVerificationHistory({
    conductorId,
    page = 1,
    limit = 10,
    startDate,
    endDate,
  }) {
    try {
      const skip = (page - 1) * limit;

      const where = {
        conductorId,
      };

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [verifications, total] = await Promise.all([
        prisma.passVerifications.findMany({
          where,
          include: {
            pass: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
                passType: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.passVerifications.count({ where }),
      ]);

      return {
        verifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new CustomError(
        error.message || "Error fetching verification history",
        error.statusCode || 500
      );
    }
  }
}