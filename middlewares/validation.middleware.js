import {
  formatPhoneNumber,
  validateAlphanumericWithSpecialChars,
  validateBoolean,
  validateEmail,
  validateIncomingJson,
  validateNumber,
  validateNumeric,
  validatePassword,
  validatePhoneNumber,
  validatePureName,
} from "../utils/helpers/app.helpers.js";

import { APIResponse } from "../service/core/CustomResponse.js";
import { VALIDATION_TYPES } from "../utils/constants/app.constant.js";

// Validation handlers for different types
const validationHandlers = {
  [VALIDATION_TYPES.EMAIL]: (value) => validateEmail(value),
  [VALIDATION_TYPES.PASSWORD]: (value) => validatePassword(value),
  [VALIDATION_TYPES.PURE_NAME]: (value) => validatePureName(value),
  [VALIDATION_TYPES.ALPHA_NAME]: (value) =>
    validateAlphanumericWithSpecialChars(value),
  [VALIDATION_TYPES.PHONE]: (value) => validatePhoneNumber(value),
  [VALIDATION_TYPES.JSON]: (value) => validateIncomingJson(value),
  [VALIDATION_TYPES.INTEGER]: (value) => validateNumeric(value.toString()),
  [VALIDATION_TYPES.STRING]: (value) => typeof value === "string",
  [VALIDATION_TYPES.ARRAY]: (value) => Array.isArray(value),
  [VALIDATION_TYPES.DATETIME]: (value) => Boolean(Date.parse(value)),
  [VALIDATION_TYPES.OBJECT]: (value) => typeof value === "object",
  [VALIDATION_TYPES.BOOLEAN]: (value) => validateBoolean(value.toString()),
  [VALIDATION_TYPES.NUMBER]: (value) => validateNumber(value),
};

// Error messages for different validation types
const errorMessages = {
  [VALIDATION_TYPES.EMAIL]: (field) => `Invalid ${field}`,
  [VALIDATION_TYPES.PASSWORD]: (field) => `Provide a strong ${field}`,
  [VALIDATION_TYPES.PURE_NAME]: (field) => `Enter a valid ${field}`,
  [VALIDATION_TYPES.ALPHA_NAME]: (field) =>
    `Enter a valid alphanumeric ${field} field`,
  [VALIDATION_TYPES.PHONE]: () =>
    `Enter a valid phone number with country code`,
  [VALIDATION_TYPES.JSON]: () => `Provide a valid JSON body`,
  [VALIDATION_TYPES.INTEGER]: (item) =>
    `Provide a valid Integer value for ${item}`,
  [VALIDATION_TYPES.STRING]: (item) => `Provide a valid string for ${item}`,
  [VALIDATION_TYPES.ARRAY]: () => `Provide a valid array`,
  [VALIDATION_TYPES.DATETIME]: () => `Provide a valid date`,
  [VALIDATION_TYPES.OBJECT]: () => `Provide a valid object`,
  [VALIDATION_TYPES.BOOLEAN]: () => `Provide a valid boolean value`,
  [VALIDATION_TYPES.NUMBER]: () => `Provide a valid number`,
};

// Transforms value based on type if needed
const transformValue = (type, value) => {
  switch (type) {
    case VALIDATION_TYPES.INTEGER:
      return parseInt(value);
    case VALIDATION_TYPES.DATETIME:
      return new Date(value);
    case VALIDATION_TYPES.PHONE:
      return formatPhoneNumber(value);
    default:
      return value;
  }
};

// Validates a single field value against its type
const validateField = (value, type, field, res, required) => {
  // Handle optional fields
  if (!required && (value === undefined || value === null)) {
    return null;
  }

  // Handle required fields
  if (required && (value === undefined || value === null)) {
    return APIResponse.error(res, `${field} is required`, 400);
  }

  const validator = validationHandlers[type];
  if (!validator) {
    return APIResponse.error(
      res,
      `Unsupported validation type for ${field}`,
      400
    );
  }

  if (!validator(value)) {
    const getMessage = errorMessages[type] || ((field) => `Invalid ${field}`);
    return APIResponse.error(res, getMessage(field), 400);
  }

  return null;
};

// Validates array items
const validateArrayItems = (item, array, arrayType, field, res) => {
  if (arrayType === VALIDATION_TYPES.OBJECT) {
    for (const object of array) {
      const error = validateObjectFields(object, item.schema, res);
      if (error) return error;

      // Transform the object fields
      for (const schemaItem of item.schema) {
        if (object[schemaItem.field] !== undefined) {
          object[schemaItem.field] = transformValue(
            schemaItem.type,
            object[schemaItem.field]
          );
        }
      }
    }
    return null;
  } else {
    for (let arrayItem of array) {
      const error = validateField(
        arrayItem,
        arrayType,
        field,
        res,
        item.required
      );
      if (error) return error;

      // Transform the array item
      arrayItem = transformValue(arrayType, arrayItem);
    }
    return null;
  }
};

const validateObjectFields = (object, schema, res) => {
  for (const item of schema) {
    const fieldValue = object[item?.field];

    const error = validateField(
      fieldValue,
      item?.type,
      item.field,
      res,
      item.required
    );
    if (error) return error;

    // Transform the field value
    if (fieldValue !== undefined) {
      object[item.field] = transformValue(item.type, fieldValue);
    }
  }
  return null;
};

export const higherOrderUserDataValidation = (dataObject = []) => {
  return async (req, res, next) => {
    try {
      for (const item of dataObject) {
        const fieldValue = req.body[item.field];

        if (!fieldValue) {
          return APIResponse.error(res, `${item.field} is required`, 400);
        }

        // Check required fields
        if (!fieldValue && item.required && validateBoolean(fieldValue)) {
          return APIResponse.error(res, `${item.field} is required`, 400);
        }

        // Skip validation if field is not required and value is empty
        if (!fieldValue && !item.required) {
          continue;
        }

        // Handle custom validation
        if (item.type === VALIDATION_TYPES.CUSTOM) {
          if (!item.format(fieldValue) && item.required) {
            return APIResponse.error(
              res,
              item.message || `Invalid ${item.field}`,
              400
            );
          }
          continue;
        }

        // Handle array validation
        if (item.type === VALIDATION_TYPES.ARRAY) {
          if (item.arrayType) {
            const itemsError = validateArrayItems(
              item,
              fieldValue,
              item.arrayType,
              item.field,
              res
            );
            if (itemsError) return itemsError;
          } else {
            const arrayError = validateField(
              fieldValue,
              VALIDATION_TYPES.ARRAY,
              item.field,
              res,
              item.required
            );
            if (arrayError) return arrayError;
          }

          continue;
        }

        if (item.type === VALIDATION_TYPES.OBJECT) {
          const error = validateObjectFields(fieldValue, item.schema, res);
        }

        if (item.validate) {
          const error = item.validate(fieldValue);
          if (error) return error;
        }

        // Handle regular field validation
        const error = validateField(
          fieldValue,
          item.type,
          item.field,
          res,
          item.required
        );
        if (error) return error;

        // Transform value if needed
        req.body[item.field] = transformValue(item.type, fieldValue);
      }

      next();
    } catch (error) {
      console.error("Validation error:", error);
      return APIResponse.error(res, error.message, error.statusCode || 500);
    }
  };
};

// Method to validate route params
export const validateRequestParams = (schema) => {
  return async (req, res, next) => {
    for (const item of schema) {
      const fieldValue = req.params[item.field];
      if (!fieldValue) {
        return APIResponse.error(res, `${item.field} is required`, 400);
      }

      const error = validateField(
        fieldValue,
        item.type,
        item.field,
        res,
        item.required
      );
      if (error) return error;

      req.params[item.field] = transformValue(item.type, fieldValue);
    }
    next();
  };
};
