import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("Testing Cloudinary Configuration:");
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing",
);
console.log(
  "CLOUDINARY_API_KEY:",
  process.env.CLOUDINARY_API_KEY ? "✓ Set" : "✗ Missing",
);
console.log(
  "CLOUDINARY_API_SECRET:",
  process.env.CLOUDINARY_API_SECRET ? "✓ Set (hidden)" : "✗ Missing",
);
console.log("");

if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log("Testing Cloudinary connection...");

  cloudinary.api
    .ping()
    .then(() => {
      console.log("✓ Cloudinary connection successful!");
      console.log("✓ Upload functionality should work.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("✗ Cloudinary connection failed:", error.message);
      process.exit(1);
    });
} else {
  console.error("✗ Cloudinary credentials are incomplete");
  process.exit(1);
}

