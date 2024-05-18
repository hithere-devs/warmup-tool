### Project Name

**Description:** A tool built in TypeScript and Node.js to parse and categorize
emails from Google and Outlook accounts, and respond to them automatically using
AI.

---

#### Setup Instructions:

1. **Environment Variables:**

   - Create a `.env` file in the root directory of the project.
   - Add the following environment variables with their respective values:
     ```
     PORT=3000
     GMAIL_CLIENT_ID=****
     GMAIL_CLIENT_SECRET=****
     GMAIL_REDIRECT_URI=******
     OUTLOOK_CLIENT_ID=******
     OUTLOOK_CLIENT_SECRET=******
     OUTLOOK_REDIRECT_URI=******
     OUTLOOK_TENANT_ID=******
     OPENAI_API_KEY=*****
     ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Run in Development Mode:**

   ```bash
   npm run dev
   ```

4. **Build for Production:**

   ```bash
   npm run build
   ```

5. **Start the Server:**

   ```bash
   npm start
   ```

   This command will start the server in production mode.

---

#### Dependencies:

- [@azure/msal-node](https://www.npmjs.com/package/@azure/msal-node): Microsoft
  Authentication Library for Node.js (MSAL)
- [@google-cloud/local-auth](https://www.npmjs.com/package/@google-cloud/local-auth):
  Library for Google Cloud local authentication
- [@microsoft/microsoft-graph-client](https://www.npmjs.com/package/@microsoft/microsoft-graph-client):
  Microsoft Graph API client library
- [@types/express](https://www.npmjs.com/package/@types/express): TypeScript
  types for Express.js
- [axios](https://www.npmjs.com/package/axios): Promise-based HTTP client for
  Node.js and browsers
- [bull](https://www.npmjs.com/package/bull): Premium job queue for Node.js,
  backed by Redis
- [bullmq](https://www.npmjs.com/package/bullmq): Advanced Redis-backed job
  queue for Node.js
- [cors](https://www.npmjs.com/package/cors): Middleware for enabling CORS
  (Cross-Origin Resource Sharing) in Express.js
- [dotenv](https://www.npmjs.com/package/dotenv): Module for loading environment
  variables from a `.env` file
- [express](https://www.npmjs.com/package/express): Fast, unopinionated,
  minimalist web framework for Node.js
- [express-session](https://www.npmjs.com/package/express-session): Simple
  session middleware for Express.js
- [googleapis](https://www.npmjs.com/package/googleapis): Google API client
  library for Node.js
- [ioredis](https://www.npmjs.com/package/ioredis): Robust, full-featured Redis
  client for Node.js
- [openai](https://www.npmjs.com/package/openai): OpenAI API client for Node.js

---

#### Scripts:

- `start`: Run the project in production mode using Node.js.
- `dev`: Run the project in development mode using `nodemon` for automatic
  reloading on file changes.
- `build`: Compile TypeScript files into JavaScript files using the TypeScript
  compiler (`tsc`).
- `lint`: Lint the project files using ESLint.
- `test`: Run tests using Jest.
- `prettier`: Format project files using Prettier.

---

#### Usage

**Connect Email Accounts:**

1. Navigate to http://localhost:3000/connect in your browser.
2. Follow the OAuth flow to connect your Google and Outlook email accounts.

**Send Test Email:**

- Send an email to the connected accounts from another email address.

**View Automated Responses:**

- Check the inbox of the connected email accounts to view automated responses
  based on the email content.

#### Notes:

- This project uses BullMQ for task scheduling and Redis for storing job queues.
- Make sure to handle errors gracefully and monitor job processing using
  BullMQ's dashboard.
- Ensure that you have provided valid OAuth credentials for Google and Outlook
  accounts in the `.env` file.
- Customize the email parsing and categorization logic in the respective
  services as per your requirements.
- Refer to the official documentation of BullMQ, OpenAI, and other dependencies
  for detailed usage instructions.

---

#### License:

This project is licensed under the
[ISC License](https://opensource.org/licenses/ISC).

---

#### Author:

Azhar Mahmood

---
