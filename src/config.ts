export const config = {
  customerId: process.env.TELESIGN_CUSTOMER_ID || "",
  apiKey: process.env.TELESIGN_API_KEY || "",
} as const;

export const API_BASES = {
  rest: "https://rest-ww.telesign.com",
  verify: "https://verify.telesign.com",
  intelligence: "https://detect.telesign.com",
} as const;

// Validate config on startup
export function validateConfig() {
  if (!config.customerId || !config.apiKey) {
    console.error("Warning: TELESIGN_CUSTOMER_ID and TELESIGN_API_KEY environment variables not set");
  }
}