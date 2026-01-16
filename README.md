# TeleSign MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with TeleSign APIs for AI assistants like Anthropic's Claude, OpenAI's ChatGPT, or Google's Gemini. Enable your AI to send SMS messages, verify phone numbers, assess fraud risk, and more.

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard that allows AI assistants to securely connect to external data sources and tools. This server implements MCP to give AI assistants direct access to TeleSign's communication and verification APIs.

## 🔨 Features

### Available Tools

| Tool                       | Description                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| `verifyapi_send_otp`       | Send a one-time passcode via SMS, voice, WhatsApp, Viber, RCS, or email with automatic fallback support |
| `verifyapi_check_code`     | Verify an OTP code entered by the user                                                                  |
| `verifyapi_get_status`     | Check the status of an ongoing verification                                                             |
| `phoneid_get_info`         | Get phone number details including type (mobile/landline/VoIP), carrier, and location                   |
| `intelligence_assess_risk` | Get fraud risk score (0-1000) with allow/flag/block recommendation                                      |
| `messaging_send_sms`       | Send SMS messages (OTP, alerts, or marketing)                                                           |
| `docs_search`              | Search TeleSign documentation                                                                           |
| `docs_get`                 | Retrieve full documentation for a topic                                                                 |

### Key Capabilities

- **Multi-Channel OTP Verification** - Send verification codes via SMS, voice, WhatsApp, Viber, RCS, or email with automatic fallback between channels
- **Phone Intelligence** - Identify phone number type, carrier, and geographic location
- **Fraud Prevention** - Real-time risk scoring to detect fraudulent phone numbers
- **SMS Messaging** - Send transactional or marketing messages
- **Built-in Documentation** - Access TeleSign API docs directly through the AI assistant

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- Cursor, Claude Code, VSCode, Windsurf or another MCP Client
- A TeleSign account with API credentials ([Sign up here](https://portal.telesign.com/signup))

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/telesign-mcp.git
   cd telesign-mcp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Set your TeleSign API credentials:

```bash
export TELESIGN_CUSTOMER_ID="your-customer-id"
export TELESIGN_API_KEY="your-api-key"
```

### Claude Desktop Configuration

Add this to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "telesign": {
      "command": "node",
      "args": ["/path/to/telesign-mcp/build/index.js"],
      "env": {
        "TELESIGN_CUSTOMER_ID": "your-customer-id",
        "TELESIGN_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Usage Examples

Once configured, you can ask Claude to:

- _"Send an OTP to +15551234567 via SMS with voice fallback after 30 seconds"_
- _"Verify the code 123456 for reference ID abc-123"_
- _"Get information about the phone number +15551234567"_
- _"Check the fraud risk score for +15551234567"_
- _"Send an SMS to +15551234567 saying 'Your order has shipped'"_

## 📚 API Documentation

The server includes built-in documentation accessible via the `docs_search` and `docs_get` tools. Available topics:

- `verify-api` - OTP verification endpoints and flows
- `phone-id` - Phone number lookup details
- `intelligence` - Risk scoring and fraud detection
- `messaging-sms` - SMS messaging guide
- `status-codes` - API response codes reference

## 🤝 Supported APIs

### Currently Functional

- [x] **Verify API** - Multi-channel OTP verification (SMS, voice, WhatsApp, Viber, RCS, email) with fallback support
- [x] **Phone ID API** - Phone number intelligence with identity attribute add-ons (SIM swap, number deactivation, contact info, porting history, etc.)
- [x] **Intelligence API** - Fraud risk scoring and recommendations
- [x] **Messaging API** - Basic SMS sending (`/v1/messaging`)

### Coming Soon

- [ ] Bulk SMS API
- [ ] Messaging API (full-featured)
- [ ] SMS Verify API (standalone)
- [ ] Silent Verify API
- [ ] Templates API
- [ ] Voice V2 API
- [ ] Accounts API
- [ ] App Verify API
- [ ] Flow Builder API

## 💻 Development

```bash
# Watch mode for development
npm run dev

# Build for production
npm run build

# Run the server directly
npm start
```

## 📄 License

Apache 2.0 - See [LICENSE](LICENSE) for details.

## 🛟 Support

- [TeleSign Developer Portal](https://developer.telesign.com/)
- [TeleSign Support](https://support.telesign.com/)
- [MCP Documentation](https://modelcontextprotocol.io/)

## ⚠️ Disclaimer

This is a community-driven, open source project and is **not officially affiliated with, endorsed by, or supported by TeleSign**. The author(s) do not own or claim any rights to the TeleSign trademark, name, or branding. "TeleSign" and any associated logos are trademarks of TeleSign Corporation.

This project is provided "as is" without warranty of any kind. Use at your own risk. For official TeleSign support not related to this MCP server, please contact TeleSign directly.
