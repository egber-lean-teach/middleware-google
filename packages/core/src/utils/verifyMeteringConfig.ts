import { logger } from "../models/Logger";

export const verifyMeteringConfig = () => {
  if (
    !process.env.REVENIUM_METERING_API_KEY ||
    !process.env.REVENIUM_METERING_BASE_URL
  ) {
    logger.warning(
      "❌ REVENIUM_METERING_API_KEY or REVENIUM_METERING_BASE_URL not found"
    );
    return false;
  }
  return true;
};
