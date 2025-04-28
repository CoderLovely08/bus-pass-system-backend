import { decodeJwtToken } from "../utils/helpers/app.helpers.js";

// --------------------------------------------
// Middleware to validate jwt token
// --------------------------------------------

/**
 * @description Middleware to validate jwt token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next function
 */
export const validateToken = async (req, res, next) => {
  try {
    const token =
      req.header("x-auth-token") ||
      req.query?.accessToken ||
      req.cookies?.accessToken ||
      req.headers?.authorization?.split(" ")[1];

    // Check if token is provided
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    // Verify token
    const decoded = decodeJwtToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --------------------------------------------
// Middleware to check role of the user
// --------------------------------------------

/**
 * @description Middleware to check role of the user
 * @param {Array} requiredRoles - Required roles
 * @returns {Function} Middleware function
 */
export const checkRole = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const userRole = req.user?.userType || "";

      if (!requiredRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this route",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

// --------------------------------------------
// Middleware to check permissions
// --------------------------------------------

/**
 * @description Middleware to check permissions
 * @param {string} permissionName - Permission name
 * @returns {Function} Middleware function
 */
export const checkPermissions = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userPermissions = req.user?.permissions || [];

      const hasPermission = userPermissions.includes(permissionName);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this route",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};
