import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";
import jwt from "jsonwebtoken";
import { customLogger } from "../../middlewares/logging.middleware.js";
import { CustomError } from "../../service/core/CustomResponse.js";
import { TOKEN_TYPES } from "../constants/app.constant.js";
import config from "../../config/app.config.js";

/**
 * @description Method to validate an email
 * @param {string} email
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  try {
    return validator.isEmail(email);
  } catch (error) {
    console.error(`Error in validateEmail: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to validate a password
 * @param {string} password
 * @returns {boolean}
 */
export const validatePassword = (password) => {
  try {
    return validator.isStrongPassword(password);
  } catch (error) {
    console.error(`Error in validatePassword: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to validate a phone number
 * @param {string} phoneNumber
 * @returns {boolean}
 */
export const validatePhoneNumber = (phoneNumber) => {
  try {
    return isValidPhoneNumber(phoneNumber);
  } catch (error) {
    console.error(`Error in validatePhoneNumber: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to validate a boolean
 * @param {boolean} boolean
 * @returns {boolean}
 */
export const validateBoolean = (boolean) => {
  try {
    return validator.isBoolean(boolean);
  } catch (error) {
    console.error(`Error in validateBoolean: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to validate json body
 * @param {Object} jsonBody
 * @returns {boolean}
 */
export const validateIncomingJson = (jsonBody) => {
  try {
    return validator.isJSON(JSON.stringify(jsonBody));
  } catch (error) {
    console.error(`Error in validateIncomingJson: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to validate a number
 * @param {number} numericValue
 * @returns {boolean}
 */
export const validateNumeric = (numericValue) => {
  return validator.isInt(numericValue);
};

/**
 * @description Method to format a phone number
 * @param {string} phoneNumber
 * @returns {string}
 */
export const formatPhoneNumber = (phoneNumber) => {
  const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

  const transformedPhoneNumber = `+${parsedPhoneNumber.countryCallingCode}-${parsedPhoneNumber.nationalNumber}`;

  return transformedPhoneNumber;
};

/**
 * @description Method to generate otp
 * @param {number} OTP_DIGITS
 * @returns {string}
 */
export const generateRandomOTP = async (OTP_DIGITS = 6) => {
  return crypto.randomInt(111111, 999999).toString();
};

/**
 * @description Method to validate a name
 * @param {string} name
 * @returns {boolean}
 */
export const validatePureName = (name) => {
  try {
    return validator.isAlpha(name.replace(/\s/g, ""));
  } catch (error) {
    console.error(`Error in validateName: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to validate alphanumeric string
 * @param {string} string
 * @returns {boolean}
 */
export const validateAlphanumeric = (string) => {
  try {
    return validator.isAlphanumeric(string.replace(/\s/g, ""));
  } catch (error) {
    console.error(`Error in validateAlphanumeric: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to validate alphanumeric string with allowed special characters
 * @param {string} string
 * @returns {boolean}
 */
export const validateAlphanumericWithSpecialChars = (string) => {
  try {
    return validator.isAlphanumeric(string.replace(/\s/g, ""), "en-US", {
      ignore: "-'#$@!_*&^%(){}|\\/",
    });
  } catch (error) {
    console.error(
      `Error in validateAlphanumericWithSpecialChars: ${error.message}`
    );
    return false;
  }
};

/**
 * @description Validate and parse phone number
 * @param {string} phoneNumber
 * @param {string} countryCode
 * @returns {Object}
 */
export const parsePhoneNumber = (phoneNumber, countryCode) => {
  try {
    return parsePhoneNumberFromString(phoneNumber);
  } catch (error) {
    console.error(`Error in parsePhoneNumber: ${error.message}`);
    return null;
  }
};

/**
 * @description Method to generate a random string of a given length
 * @param {number} length
 * @returns {string}
 */
export const generateRandomString = (length = 8) => {
  try {
    const randomString = crypto.randomBytes(length).toString("hex");
    return randomString.toUpperCase();
  } catch (error) {
    console.error(`Error in generateRandomString: ${error.message}`);
    return null;
  }
};

/**
 * @description Method to get file path from a supabase URL
 * @param {string} url
 * @returns {string}
 */
export const getFilePathFromUrl = (url) => {
  try {
    return url.split("/").slice(-2).join("/");
  } catch (error) {
    console.error(`Error in getFilePathFromUrl: ${error.message}`);
    return null;
  }
};

/**
 * @description Method to hash a password
 * @param {string} password
 * @returns {string}
 */
export const hashPassword = (password) => {
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return hashedPassword;
  } catch (error) {
    console.error(`Error in hashPassword: ${error.message}`);
    throw new CustomError(`Error hashing password: ${error.message}`);
  }
};

// Method to compare a password with a hashed password
export const comparePassword = async (password, hashedPassword) => {
  try {
    const isPasswordValid = bcrypt.compareSync(password, hashedPassword);
    return isPasswordValid;
  } catch (error) {
    console.error(`Error in comparePassword: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to generate a jwt token
 * @param {Object} payload
 * @param {string} tokenType
 * @returns {string}
 */
export const generateJwtToken = (payload, tokenType = TOKEN_TYPES.ACCESS) => {
  try {
    const secret =
      tokenType === TOKEN_TYPES.ACCESS
        ? config.JWT.ACCESS_TOKEN.SECRET
        : config.JWT.REFRESH_TOKEN.SECRET;

    const token = jwt.sign(payload, secret, {
      expiresIn:
        tokenType === TOKEN_TYPES.ACCESS
          ? config.JWT.ACCESS_TOKEN.EXPIRES_IN
          : config.JWT.REFRESH_TOKEN.EXPIRES_IN,
    });
    return token;
  } catch (error) {
    customLogger.error(`Error generating ${tokenType} token: ${error.message}`);
    throw new CustomError(
      `Error generating ${tokenType} token: ${error.message}`
    );
  }
};

/**
 * @description Method to validate a time in the format of HH:MM
 * @param {string} time
 * @returns {boolean}
 */
export const validateHourMinTime = (time) => {
  try {
    const timeArray = time.split(":");
    if (timeArray.length !== 2) {
      return false;
    }

    const hours = parseInt(timeArray[0]);
    const minutes = parseInt(timeArray[1]);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error in validateHourMinTime: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to decode a jwt token
 * @param {string} token
 * @param {string} tokenType
 * @returns {Object}
 */
export const decodeJwtToken = (token, tokenType = TOKEN_TYPES.ACCESS) => {
  try {
    const secret =
      tokenType === TOKEN_TYPES.ACCESS
        ? config.JWT.ACCESS_TOKEN.SECRET
        : config.JWT.REFRESH_TOKEN.SECRET;

    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error(`Error in decodeJwtToken: ${error.message}`);
    return null;
  }
};

/**
 * @description Method to validate a mac address
 * @param {string} macAddress
 * @returns {boolean}
 */
export const validateMacAddress = (macAddress) => {
  try {
    return validator.isMACAddress(macAddress, {
      no_separators: true,
    });
  } catch (error) {
    console.error(`Error in validateMacAddress: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to validate a number
 * @param {number} number
 * @returns {boolean}
 */
export const validateNumber = (number) => {
  try {
    return validator.isNumeric(number.toString());
  } catch (error) {
    console.error(`Error in validateNumber: ${error.message}`);
    return false;
  }
};

/**
 * @description Method to get a formatted file name in the format of timestamp_fileName_fileExtension
 * @param {string} fileName
 * @returns {string}
 */
export const getFormattedFileName = (fileName) => {
  try {
    const fileExtension = fileName.split(".").pop();
    const formattedFileName = `${new Date().getTime()}_${fileName
      .split(".")[0]
      .split(/\s+/)
      .join("_")}.${fileExtension}`;
    return formattedFileName;
  } catch (error) {
    throw new CustomError(
      `Error in getFormattedFileName: ${error.message}`,
      501
    );
  }
};

/**
 * @description Method to get a file name from a url
 * @param {string} url
 * @returns {string}
 */
export const getFileNameFromUrl = (url) => {
  try {
    return url.split("/").pop();
  } catch (error) {
    console.error(`Error in getFileNameFromUrl: ${error.message}`);
    return null;
  }
};

/**
 * @description Method to format a mac address in the format of XX:XX:XX:XX:XX:XX
 * @param {string} macAddress
 * @returns {string}
 */
export const formatMacAddress = (macAddress) => {
  try {
    return macAddress
      ?.match(/.{1,2}/g)
      .join(":")
      .toUpperCase();
  } catch (error) {
    console.error(`Error in formatMacAddress: ${error.message}`);
    return null;
  }
};


export const generateQRCode = (data) => {
  try {
    return qrcode.toDataURL(data);
  } catch (error) {
    console.error(`Error in generateQRCode: ${error.message}`);
    return null;
  }
};
