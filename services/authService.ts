import {
	AuthenticationResult,
	Configuration,
	NodeAuthOptions,
	PublicClientApplication,
} from '@azure/msal-node';
import axios from 'axios';

// Define a custom type extending NodeAuthOptions with redirectUri
interface ExtendedAuthOptions extends NodeAuthOptions {
	redirectUri?: string;
}

export async function getGoogleTokens(code: string): Promise<any> {
	try {
		const response = await axios.post('https://oauth2.googleapis.com/token', {
			code,
			client_id: process.env.GMAIL_CLIENT_ID,
			client_secret: process.env.GMAIL_CLIENT_SECRET,
			redirect_uri: process.env.GMAIL_REDIRECT_URI,
			grant_type: 'authorization_code',
		});
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Define MSAL configuration
const msalConfig: Configuration = {
	auth: {
		clientId: process.env.OUTLOOK_CLIENT_ID || '',
		authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}`,
		redirectUri: process.env.OUTLOOK_REDIRECT_URI, // Update with your redirect URI
	} as ExtendedAuthOptions, // Cast to the extended type
};

// Initialize PublicClientApplication
export const pca = new PublicClientApplication(msalConfig);

// Function to get Outlook tokens
export async function getOutlookTokens(code: string): Promise<string> {
	try {
		const tokenRequest = {
			code,
			scopes: ['https://graph.microsoft.com/.default'],
			redirectUri: 'http://localhost:8080/', // Update with your redirect URI
		};
		const response: AuthenticationResult = await pca.acquireTokenByCode(
			tokenRequest
		);
		return response.accessToken;
	} catch (error) {
		throw error;
	}
}
