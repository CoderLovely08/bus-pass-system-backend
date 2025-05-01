import { prisma } from "../../app.js";
import { SCAN_METHOD } from "../../utils/constants/app.constant.js";
import { CustomError } from "../core/CustomResponse.js";

export class ConductorService {

  /**
   * Get dashboard
   * @param {string} conductorId - Conductor ID
   * @returns {Promise<Object>} Dashboard
   */
  static async getDashboard(conductorId) {
    try {
      // Today's date
      const dashboard = await prisma.conductorScan.findMany({
        where: { conductorId, scanTime: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        orderBy: {
          scanTime: "desc",
        },
        include: {
          busPass: {
            select: {
              id: true,
              passNumber: true,
              isActive: true,
              application: {
                select: {
                  user: {
                    select: {
                      id: true,
                      fullName: true,
                    }
                  },
                  passType: true,
                }
              }
            }
          },
        },
      });

      const totalScans = dashboard.length;
      const totalValidScans = dashboard.filter(scan => scan.isValid).length;
      const totalInvalidScans = dashboard.filter(scan => !scan.isValid).length;
      const totalQRScans = dashboard.filter(scan => scan.scanMethod === SCAN_METHOD.QR_CODE).length;
      const totalManualScans = dashboard.filter(scan => scan.scanMethod === SCAN_METHOD.MANUAL_ENTRY).length;

      return {
        dashboard: dashboard.slice(0, 10),
        totalScans,
        totalValidScans,
        totalInvalidScans,
        totalQRScans,
        totalManualScans,
      };
    } catch (error) {
      throw new CustomError(
        error.message || "Error fetching dashboard",
        error.statusCode || 500
      );
    }
  }


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

      const pass = await prisma.busPass.findUnique({
        where: { applicationId: passId },
        include: {
          application: {
            include: {
              passType: true,
            },
          },
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
   * @param {string} params.scanMethod - Scan method
   * @returns {Promise<Object>} Verification result
   */
  static async verifyPassByNumber({ passNumber, conductorId, scanMethod }) {
    try {
      const pass = await prisma.busPass.findUnique({
        where: {
          passNumber,
          //  scans: {
          //   some: {
          //     scanTime: {
          //       gte: new Date(new Date().setDate(new Date().getDate() - 3)),
          //     }
          //   }
          // }
        },
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
          scans: {
            select: {
              id: true,
            }
          }
        },
      });

      if (!pass) {
        throw new CustomError("Pass not found", 404);
      }

      if (pass.application.passType.perDayLimit < pass.scans.length) {
        throw new CustomError("Daily limit exceeded", 400);
      }

      const now = new Date();
      const isExpired = now > pass.validUntil;
      const isNotStarted = now < pass.validFrom;

      // Create verification record
      const verification = await prisma.conductorScan.create({
        data: {
          busPass: {
            connect: {
              id: pass.id,
            },
          },
          conductor: {
            connect: {
              id: conductorId,
            },
          },
          scanMethod,
          isValid: !isExpired && !isNotStarted && pass.isActive === true,
        },
      });

      return pass;
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
        prisma.conductorScan.findMany({
          where,
          include: {
            busPass: {
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
            },
          },
          orderBy: {
            id: "desc",
          },
          skip,
          take: limit,
        }),
        prisma.conductorScan.count({ where }),
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
