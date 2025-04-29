# Features

This document contains which you can integrate into the project by following the steps mentioned in the respective sections.

## 1. Supabase

### 1.1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 1.2. Create a supabase client configuration

```js
// config/supabase.config.js

import { createClient } from "@supabase/supabase-js";
import { config } from "./app.config.js";

const supabaseUrl = config.SUPABASE.URL;
const supabaseKey = config.SUPABASE.PUBLIC_KEY;
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
```

### 1.3. Usage

```js
// services/supabase.service.js
import { getFilePathFromUrl } from "../utils/app.utils.js";
import { config } from "../config/index.js";
import { supabaseClient } from "../config/supabase.config.js";

export class SupabaseService {
  /**
   * Uploads a file to Supabase Storage
   * @param {string} originalFileName - The original name of the file
   * @param {Buffer} fileBuffer - The file content as a buffer
   * @param {string} fileType - The type of the file (e.g., 'image/jpeg')
   * @param {string} folderName - The name of the folder to store the file in
   * @returns {Object|Error|boolean} - Returns uploaded data if successful, error object if failed, or false if an exception occurred
   */
  static async supabaseUploadFile(
    originalFileName,
    fileBuffer,
    fileType,
    folderName = config.SUPABASE.LOGOS_FOLDER
  ) {
    try {
      const randomFileName = `${originalFileName.replaceAll(
        " ",
        "_"
      )}_${Date.now()}`;
      // Generate a random filename
      const filePath = `${folderName}/${randomFileName}`; // Specify the path of the file in the bucket

      // Upload file to Supabase Storage
      const { data, error } = await supabaseClient.storage
        .from(config.SUPABASE.BUCKET_NAME) // Access the specified bucket
        .upload(`${filePath}`, fileBuffer, {
          // Upload the file
          contentType: fileType, // Specify content type of the file
        });

      // Construct the file URL
      const fileUrl = `${config.SUPABASE.URL}/storage/v1/object/public/${config.SUPABASE.BUCKET_NAME}${filePath}`;

      // Check if upload was successful
      if (data) {
        return {
          success: true,
          statusCode: 200,
          message: "File uploaded successfully",
          fileSrc: filePath,
          fileUrl,
        }; // Return uploaded data
      } else {
        return {
          success: false,
          statusCode: error.statusCode,
          message: `Error uploading file: ${error.message}`,
        };
      }
    } catch (error) {
      console.error(`Error in supabaseUploadFile: ${error.message}`);
      return {
        success: false,
        statusCode: 500,
        message: error.message,
      };
    }
  }

  /**
   * Retrieves a file from Supabase Storage
   * @param {string} fileName - The name of the file to retrieve
   * @returns {Object} - Returns the public URL of the file if successful, or error object if failed
   */
  static async supabaseGetFile(fileUrl) {
    try {
      const fileSrc = getFilePathFromUrl(fileUrl); // Get the file path from the URL

      // Extract the folder name and file name from the fileSrc
      const folderName = fileSrc.split("/")[0];
      const fileName = fileSrc.split("/")[1];
      // Retrieve public URL of the file from Supabase Storage
      const { data } = supabaseClient.storage
        .from(config.SUPABASE.BUCKET_NAME) // Access the specified bucket
        .getPublicUrl(`${folderName}/${fileName}`); // Get the public URL of the file

      return {
        success: true,
        message: "File fetched",
        publicUrl: data.publicUrl,
      };
    } catch (error) {
      console.error(`Error in supabaseGetFile: ${error.message}`);
      return {
        success: true,
        message: error.message,
      };
    }
  }

  /**
   * Deletes a file from Supabase Storage
   * @param {string} fileUrl - The URL of the file to delete
   * @returns {Object} - Returns success message if successful, or error object if failed
   */
  static async supabaseDeleteFile(fileUrl) {
    try {
      const fileSrc = getFilePathFromUrl(fileUrl); // Get the file path from the URL

      // Extract the folder name and file name from the fileSrc
      const folderName = fileSrc.split("/")[0];
      const fileName = fileSrc.split("/")[1];

      // Delete the file from Supabase Storage
      const { error } = await supabaseClient.storage
        .from(config.SUPABASE.BUCKET_NAME) // Access the specified bucket
        .remove([`${fileSrc}`]); // Remove the specified file

      if (!error) {
        return {
          success: true,
          statusCode: 200,
          message: "File deleted successfully",
        };
      } else {
        return {
          success: false,
          statusCode: error.statusCode,
          message: error.message,
        };
      }
    } catch (error) {
      console.error(`Error in supabaseDeleteFile: ${error.message}`);
      return {
        success: false,
        statusCode: 500,
        message: error.message,
      };
    }
  }
}
```

## 2. Node Mailer

### 2.1. Install Dependencies

```bash
npm install nodemailer
```

### 2.2. Create a node mailer configuration

```js
// config/nodemailer.config.js

import { config } from "./app.config.js";
import nodemailer from "nodemailer";

export const nodemailerTransporter = nodemailer.createTransport({
  host: config.EMAIL.SMTP_HOST,
  port: config.EMAIL.SMTP_PORT,
  auth: {
    user: config.EMAIL.SMTP_USER,
    pass: config.EMAIL.SMTP_PASSWORD,
  },
});
```

### 2.3. Usage

```js
/**
 * Sends an email using the configured transporter and specified options.
 *
 * @param {string} userEmail - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} templateHtml - The HTML content of the email.
 * @param {string} from - The sender's email address.
 * @returns {Promise<Object>} - A result object indicating success or failure.
 */
const sendEmail = async (
  userEmail,
  subject,
  templateHtml,
  from = "Hello <support@hello.com>"
) => {
  try {
    const mailOptions = {
      from,
      to: userEmail,
      subject,
      html: templateHtml,
    };

    await nodemailerTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Failed to send email ${userEmail}: ${error}`);
    throw new CustomError(error.message, error.statusCode);
  }
};
```

## 3. Multer

### 3.1. Install Dependencies

```bash
npm install multer
```

### 3.2. Create a multer configuration

```js
// config/multer.config.js

import multer from "multer";

const MAX_FILE_SIZE_MB = 3;

const storage = multer.memoryStorage();

const limits = { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 };

const upload = multer({ storage, limits });

export default upload;
```

### 3.3. Use the upload middleware in the route

```js
// routes/v1/auth.routes.js

router.post("/signup", upload.single("profilePicture"), signup);
```

## 4. Firebase Admin SDK

### 4.1. Install Dependencies

```bash
npm install firebase-admin
```

### 4.2. Create a firebase admin configuration

```js
// config/firebase.config.js

import admin from "firebase-admin";
import { config } from "./app.config.js";

export const firebaseApp = admin.initializeApp({
  credential: admin.credential.cert(config.FIREABSE_SERIVCE_ACCOUNT),
});
```

### 4.3. Usage

```js
export const sendNotification = async (token, title, message) => {
  const payload = {
    notification: {
      title,
      body,
    },
    token,
  };

  await firebaseApp.messaging().sendEach(payloads);
};
```

## 5. AWS S3

### 5.1. Install Dependencies

```bash
npm install @aws-sdk/client-s3
```

### 5.2. Create a aws s3 configuration

```js
// config/aws.config.js

import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./index.js";

export const s3Client = new S3Client({
  region: config.AWS.S3.REGION,
  credentials: {
    accessKeyId: config.AWS.S3.ACCESS_KEY,
    secretAccessKey: config.AWS.S3.SECRET_KEY,
  },
});
```

### 5.3. Usage

```js
// services/s3.service.js
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "../config/app.config.js";
import { s3Client } from "../config/aws.config.js";

export class S3Service {
  /**
   * Uploads a file to AWS S3
   *
   * @param {string} originalFileName - The original name of the file
   * @param {Buffer} fileBuffer - The file buffer to upload
   * @param {string} fileType - The type of the file
   * @param {string} folderName - The folder name to upload the file to
   * @returns {Promise<Object>} - A result object indicating success or failure
   */
  static async uploadFileToS3(
    originalFileName,
    fileBuffer,
    fileType,
    folderName = config.SUPABASE.LOGOS_FOLDER
  ) {
    try {
      const randomFileName = `${originalFileName.replaceAll(
        " ",
        "_"
      )}_${Date.now()}`;

      const params = {
        Bucket: config.AWS.S3.BUCKET_NAME,
        Key: `${folderName}/${randomFileName}`,
        Body: fileBuffer,
        ContentType: fileType,
      };

      const putCommand = new PutObjectCommand(params);

      await s3Client.send(putCommand);

      const fileUrl = `https://${config.AWS.S3.BUCKET_NAME}.s3.${config.AWS.S3.REGION}.amazonaws.com/${folderName}/${randomFileName}`;

      return {
        success: true,
        statusCode: 200,
        message: "File uploaded successfully",
        fileSrc: `${folderName}/${randomFileName}`,
        fileUrl,
      };
    } catch (error) {
      console.error(`Error in uploadFileToS3: ${error.message}`);
      return {
        success: false,
        statusCode: 500,
        message: error.message,
      };
    }
  }

  /**
   * Deletes a file from AWS S3
   *
   * @param {string} fileUrl - The URL of the file to delete
   * @returns {Promise<Object>} - A result object indicating success or failure
   */
  static async deleteFileFromS3(fileUrl) {
    try {
      const fileName = fileUrl.split("/").slice(-1)[0];

      const params = {
        Bucket: config.AWS.S3.BUCKET_NAME,
        Key: `${config.AWS.S3.REPORTS_FOLDER}/${fileName}`,
      };

      const deleteCommand = new DeleteObjectCommand(params);

      await s3Client.send(deleteCommand);

      return {
        success: true,
        statusCode: 200,
        message: "File deleted successfully",
      };
    } catch (error) {
      console.error(`Error in deleteFileFromS3: ${error.message}`);
      return {
        success: false,
        statusCode: 500,
        message: error.message,
      };
    }
  }
}
```
