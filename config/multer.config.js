// config/multer.config.js

import multer from "multer";

const MAX_FILE_SIZE_MB = 3;

const storage = multer.memoryStorage();

const limits = { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 };

const upload = multer({ storage, limits });

export default upload;
