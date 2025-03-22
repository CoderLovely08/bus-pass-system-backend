import { prisma } from "../../app.js";
import { CustomError } from "../core/CustomResponse.js";
import { generateRandomString } from "../../utils/helpers/app.helpers.js";

export class AdminService {
  /**
   * Get all applications
   * @param {Object} params - Parameters
   * @param {string} params.status - Application status
   * @param {number} params.page - Page number
   * @param {number} params.limit - Page limit
   * @param {string} params.sortBy - Sort by field
   * @param {string} params.sortOrder - Sort order
   * @returns {Promise<Object>} Applications with pagination
   */
  static async getAllApplications({
    status,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  }) {
    try {
      const skip = (page - 1) * limit;

      const where = {};
      if (status) {
        where.status = status;
      }

      const [applications, total] = await Promise.all([
        prisma.passApplication.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            passType: true,
            documents: true,
          },
          orderBy: {
            [sortBy]: sortOrder.toLowerCase(),
          },
          skip,
          take: limit,
        }),
        prisma.passApplication.count({ where }),
      ]);

      return {
        applications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new CustomError(
        error.message || "Error fetching applications",
        error.statusCode || 500
      );
    }
  }

  /**
   * Get application details
   * @param {string} applicationId - Application ID
   * @returns {Promise<Object>} Application details
   */
  static async getApplicationDetails(applicationId) {
    try {
      const application = await prisma.passApplication.findUnique({
        where: { id: applicationId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          passType: true,
          documents: true,
        },
      });

      if (!application) {
        throw new CustomError("Application not found", 404);
      }

      return application;
    } catch (error) {
      throw new CustomError(
        error.message || "Error fetching application details",
        error.statusCode || 500
      );
    }
  }

  /**
   * Update application status
   * @param {Object} params - Parameters
   * @param {string} params.applicationId - Application ID
   * @param {string} params.status - New status
   * @param {string} params.remarks - Remarks
   * @param {string} params.adminId - Admin ID
   * @returns {Promise<Object>} Updated application
   */
  static async updateApplicationStatus({
    applicationId,
    status,
    remarks,
    adminId,
  }) {
    try {
      return await prisma.$transaction(async (prisma) => {
        const application = await prisma.passApplication.findUnique({
          where: { id: applicationId },
          include: {
            passType: true,
            busPass: true,
          },
        });

        if (!application) {
          throw new CustomError("Application not found", 404);
        }

        if (application.busPass) {
          throw new CustomError("Pass already created", 400);
        }

        if (application.status === status) {
          throw new CustomError(
            `Application is already ${status.toLowerCase()}`,
            400
          );
        }

        // Update application status
        const updatedApplication = await prisma.passApproval.upsert({
          where: { applicationId },
          update: {
            status,
            admin: { connect: { id: adminId } },
          },
          create: {
            applicationId,
            adminId,
            status,
            notes: remarks,
          },
        });

        // If approved, create a pass
        if (status === "APPROVED") {
          const validFrom = new Date();
          const validTo = new Date();
          validTo.setDate(
            validTo.getDate() + application.passType.durationDays
          );

          const passNumber = generateRandomString(10);

          await prisma.busPass.create({
            data: {
              passNumber,
              application: {
                connect: {
                  id: applicationId,
                },
              },
              validFrom,
              validUntil: validTo,
              qrCode: passNumber,
            },
          });
        }

        return updatedApplication;
      });
    } catch (error) {
      throw new CustomError(
        error.message || "Error updating application status",
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
   * Create pass type
   * @param {Object} params - Parameters
   * @param {string} params.name - Pass type name
   * @param {number} params.duration - Duration in days
   * @param {number} params.price - Price
   * @param {string} params.description - Description
   * @param {string} params.adminId - Admin ID
   * @returns {Promise<Object>} Created pass type
   */
  static async createPassType({ name, duration, price, description, adminId }) {
    try {
      const existingPassType = await prisma.passType.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });

      if (existingPassType) {
        throw new CustomError("Pass type already exists", 400);
      }

      const passType = await prisma.passType.create({
        data: {
          name,
          duration,
          price,
          description,
          createdBy: adminId,
        },
      });

      return passType;
    } catch (error) {
      throw new CustomError(
        error.message || "Error creating pass type",
        error.statusCode || 500
      );
    }
  }

  /**
   * Update pass type
   * @param {Object} params - Parameters
   * @param {string} params.passTypeId - Pass type ID
   * @param {string} params.name - Pass type name
   * @param {number} params.duration - Duration in days
   * @param {number} params.price - Price
   * @param {string} params.description - Description
   * @param {string} params.adminId - Admin ID
   * @returns {Promise<Object>} Updated pass type
   */
  static async updatePassType({
    passTypeId,
    name,
    duration,
    price,
    description,
    adminId,
  }) {
    try {
      const passType = await prisma.passType.findUnique({
        where: { id: passTypeId },
      });

      if (!passType) {
        throw new CustomError("Pass type not found", 404);
      }

      if (name) {
        const existingPassType = await prisma.passType.findFirst({
          where: {
            name: {
              equals: name,
              mode: "insensitive",
            },
            id: {
              not: passTypeId,
            },
          },
        });

        if (existingPassType) {
          throw new CustomError("Pass type name already exists", 400);
        }
      }

      const updatedPassType = await prisma.passType.update({
        where: { id: passTypeId },
        data: {
          name,
          duration,
          price,
          description,
          updatedBy: adminId,
          updatedAt: new Date(),
        },
      });

      return updatedPassType;
    } catch (error) {
      throw new CustomError(
        error.message || "Error updating pass type",
        error.statusCode || 500
      );
    }
  }

  /**
   * Get dashboard statistics
   * @param {Object} params - Parameters
   * @param {Date} params.startDate - Start date
   * @param {Date} params.endDate - End date
   * @returns {Promise<Object>} Dashboard statistics
   */
  static async getDashboardStatistics({ startDate, endDate }) {
    try {
      const where = {};
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const [
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalPasses,
        activePasses,
        expiredPasses,
        totalRevenue,
      ] = await Promise.all([
        prisma.passApplication.count(),
        prisma.passApplication.count({
          where: { status: "PENDING" },
        }),
        prisma.passApplication.count({
          where: { status: "APPROVED" },
        }),
        prisma.passApplication.count({
          where: { status: "REJECTED" },
        }),
        prisma.busPass.count(),
        prisma.busPass.count({
          where: {
            status: "ACTIVE",
            validTo: {
              gte: new Date(),
            },
          },
        }),
        prisma.passes.count({
          where: {
            OR: [
              { status: "EXPIRED" },
              {
                status: "ACTIVE",
                validTo: {
                  lt: new Date(),
                },
              },
            ],
          },
        }),
        prisma.payments.aggregate({
          where: {
            status: "SUCCESS",
            ...where,
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      return {
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
        },
        passes: {
          total: totalPasses,
          active: activePasses,
          expired: expiredPasses,
        },
        revenue: {
          total: totalRevenue._sum.amount || 0,
        },
      };
    } catch (error) {
      throw new CustomError(
        error.message || "Error fetching statistics",
        error.statusCode || 500
      );
    }
  }
}
