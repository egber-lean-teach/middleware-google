import { logger } from "../models/Logger";

export const verifyApiKey = () => {
  if (!process.env.GOOGLE_API_KEY) {
    logger.warning("❌ GOOGLE_API_KEY not found");
    logger.warning("   Set: export GOOGLE_API_KEY=your-google-api-key");
    return false;
  }
  return true;
};
