import { v2 as cloudinary } from "cloudinary";
import { env, featureFlags } from "./config/env";
import { logger } from "./lib/logger";

if (featureFlags.cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else if (process.env.NODE_ENV !== "test") {
  logger.warn("[cloudinary] Disabled – missing credentials.", {
    module: "cloudinary",
  });
}

const disabledCloudinaryProxy = {
  uploader: {
    upload: async () => {
      throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars to enable uploads.");
    },
    upload_stream: () => {
      throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars to enable uploads.");
    },
    destroy: async () => {
      throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars to enable uploads.");
    },
  },
  api: {
    ping: async () => {
      throw new Error("Cloudinary is not configured. Set CLOUDINARY_* env vars to enable uploads.");
    },
  },
} as unknown as typeof cloudinary;

export const cloudinaryEnabled = featureFlags.cloudinaryEnabled;

export default featureFlags.cloudinaryEnabled ? cloudinary : disabledCloudinaryProxy;
