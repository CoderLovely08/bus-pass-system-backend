import "dotenv/config";
import { APPLICATION_ENV_TYPES } from "../utils/constants/app.constant.js";

export const config = {
  PORT: process.env.PORT,
  rateLimit: {
    windowMs: 5 * 60 * 1000,
    max: 100,
  },
  cors: {
    origin: [
      process.env.NODE_ENV === APPLICATION_ENV_TYPES.PROD
        ? process.env.CORS_PROD_ORIGIN
        : process.env.CORS_DEV_ORIGIN,
    ],
    credentials: true,
  },
  ENV: process.env.NODE_ENV,
  API_VERSION: 1,
  SUPABASE: {
    URL: process.env.SUPABASE_URL,
    PUBLIC_KEY: process.env.SUPABASE_PUBLIC_KEY,
    BUCKET_NAME: process.env.SUPABASE_BUCKET_NAME,
    DOCUMENTS_FOLDER: "/documents",
  },
  JWT: {
    ACCESS_TOKEN: {
      SECRET: process.env.JWT_ACCESS_TOKEN_SECRET,
      EXPIRES_IN: "1d",
      APP_EXPIRES_IN: "30d",
    },
    REFRESH_TOKEN: {
      SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
      EXPIRES_IN: "7d",
    },
  },
  COOKIE: {
    REFRESH_MAX_AGE: 1000 * 60 * 60 * 24 * 7, // 7 days
    ACCESS_MAX_AGE: 1000 * 60 * 60 * 24, // 1 day
    SAME_SITE: "none",
    SECURE: true,
  },
  WEB_URL:
    process.env.NODE_ENV === APPLICATION_ENV_TYPES.PROD
      ? process.env.CORS_PROD_ORIGIN
      : process.env.CORS_DEV_ORIGIN,
  FIREABSE_SERIVCE_ACCOUNT: {
    type: process.env.FIREABSE_SERVICE_TYPE,
    project_id: process.env.FIREABSE_SERVICE_PROJECT_ID,
    private_key_id: process.env.FIREABSE_SERVICE_PRIVATE_KEY_ID,
    private_key: `${process.env.FIREABSE_SERVICE_PRIVATE_KEY}`,
    client_email: process.env.FIREABSE_SERVICE_CLIENT_EMAIL,
    client_id: process.env.FIREABSE_SERVICE_CLIENT_ID,
    auth_uri: process.env.FIREABSE_SERVICE_AUTH_URI,
    token_uri: process.env.FIREABSE_SERVICE_TOKEN_URI,
    auth_provider_x509_cert_url:
      process.env.FIREABSE_SERVICE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREABSE_SERVICE_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FIREABSE_SERVICE_UNIVERSE_DOMAIN,
  },
  EMAIL: {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL,
  },
  SECURE_COOKIE: true,
  AWS: {
    S3: {
      BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
      REGION: process.env.AWS_S3_REGION,
      ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY_ID,
      SECRET_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
      REPORTS_FOLDER: "folder-name",
    },
  },
  AZURE: {
    STORAGE: {
      CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING,
      CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME,
    },
  },
};

export default config;
