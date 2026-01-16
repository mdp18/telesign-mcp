import crypto from "crypto";
import { config } from "../config.js";

export function generateAuthHeaders(
  resource: string,
  method: string = "POST",
  contentType: string = "application/json"
): Record<string, string> {
  const date = new Date().toUTCString();
  const stringToSign = `${method}\n${contentType}\n${date}\n${resource}`;

  const keyBuffer = Buffer.from(config.apiKey, "base64");
  const signature = crypto
    .createHmac("sha256", keyBuffer)
    .update(stringToSign)
    .digest("base64");

  return {
    Authorization: `TSA ${config.customerId}:${signature}`,
    Date: date,
    "Content-Type": contentType,
    "X-TS-Auth-Method": "HMAC-SHA256",
  };
}