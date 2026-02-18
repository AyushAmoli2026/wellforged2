/**
 * Frontend Configuration
 * Centralizes environment variables and global constants.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const APP_CONFIG = {
    SITE_NAME: "WellForged",
    SUPPORT_EMAIL: "support@wellforged.in",
    DEFAULT_CURRENCY: "INR",
    DEFAULT_LOCALE: "en-IN",
};
