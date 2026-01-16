import { config } from "../config.js";

export function generateAuthHeaders(contentType: string = ""): Record<string, string> {
  const credentials = Buffer.from(`${config.customerId}:${config.apiKey}`).toString("base64");

  const headers: Record<string, string> = {
    Authorization: `Basic ${credentials}`,
    Accept: "application/json",
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function makeRequest(
  baseUrl: string,
  resource: string,
  method: string = "POST",
  body?: Record<string, unknown>,
  useJson: boolean = false
): Promise<any | null> {
  let requestBody: string | undefined;
  let contentType = "";

  if (body) {
    if (useJson) {
      // Verify API uses JSON
      requestBody = JSON.stringify(body);
      contentType = "application/json";
    } else {
      // Other TeleSign APIs use form data
      requestBody = new URLSearchParams(
        Object.entries(body).map(([k, v]) => [k, String(v)])
      ).toString();
      contentType = "application/x-www-form-urlencoded";
    }
  }

  const headers = generateAuthHeaders(contentType);

  try {
    const response = await fetch(`${baseUrl}${resource}`, {
      method,
      headers,
      body: requestBody,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`);
      console.error("Response body:", JSON.stringify(data, null, 2));
      // Return error info so tools can display it
      return { _error: true, status: response.status, ...data };
    }

    return data;
  } catch (error) {
    console.error("Request failed:", error);
    return { _error: true, message: String(error) };
  }
}