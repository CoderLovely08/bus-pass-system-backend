import { prisma } from "../../app.js";
import { CustomError } from "../core/CustomResponse.js";
import { generateRandomString } from "../../utils/helpers/app.helpers.js";
import {
    PASS_STATUS,
    PAYMENT_STATUS,
} from "../../utils/constants/app.constant.js";

export class AdminService {
    /**
     * Get user types
     * @returns {Promise<Object>} User types
     */
    static async getUserTypes() {
        try {
            const userTypes = await prisma.userType.findMany();
            return userTypes;
        } catch (error) {
            throw new CustomError(
                error.message || "Error fetching user types",
                error.statusCode || 500
            );
        }
    }

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

                if (application.paymentStatus !== PAYMENT_STATUS.COMPLETED) {
                    throw new CustomError("Payment is not completed", 400);
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

                    await prisma.passApplication.update({
                        where: { id: applicationId },
                        data: {
                            status: status,
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
    static async createPassType({
        name,
        duration,
        price,
        description,
        adminId,
    }) {
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
                activePasses,
                totalRevenue,
            ] = await Promise.all([
                prisma.passApplication.count(),
                prisma.passApplication.count({
                    where: { status: PASS_STATUS.PENDING },
                }),
                prisma.busPass.count({
                    where: {
                        validUntil: {
                            gte: new Date(),
                        },
                    },
                }),
                prisma.payment.aggregate({
                    where: {
                        status: PAYMENT_STATUS.COMPLETED,
                        ...where,
                    },
                    _sum: {
                        amount: true,
                    },
                }),
            ]);

            return {
                totalApplications,
                pendingApplications,
                activePasses,
                totalRevenue: totalRevenue._sum.amount || 0,
            };
        } catch (error) {
            throw new CustomError(
                error.message || "Error fetching statistics",
                error.statusCode || 500
            );
        }
    }

    /**
     * Get all users
     * @returns {Promise<Array>} List of users
     */
    static async getAllUsers() {
        try {
            const users = await prisma.systemUsersInfo.findMany({
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    userType: {
                        select: {
                            name: true,
                        },
                    },
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
            return users;
        } catch (error) {
            throw new CustomError(
                error.message || "Error fetching users",
                error.statusCode || 500
            );
        }
    }
}
