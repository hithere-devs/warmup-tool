import { Request, Response } from 'express';
import { pca } from '../services/authService';
import { AuthResult, CustomSession, TokenRequest } from '../types';
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { generateOAuthClient } from '../utils/oauth';

export async function googleAuthCallback(
	req: Request<any, any, any, { code: string }>,
	res: Response
): Promise<void> {
	try {
		const { code } = req.query;
		if (!code) {
			throw new Error('Code not provided');
		}
		const oAuth2Client = await generateOAuthClient({
			clientId: process.env.GMAIL_CLIENT_ID || '',
			clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
			redirectUri: process.env.GMAIL_REDIRECT_URI || '',
		});

		const { tokens } = await oAuth2Client.getToken(code);
		// Save tokens in express session
		req.session.gmailAccessToken = tokens;
		res.redirect('/gmail/emails');
	} catch (error) {
		console.error('Error exchanging Google auth code for tokens:', error);
		res.status(500).send('Internal Server Error');
	}
}

const ccaConfig: Configuration = {
	auth: {
		clientId: process.env.OUTLOOK_CLIENT_ID || '',
		authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}`,
		clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
	},
};

const cca = new ConfidentialClientApplication(ccaConfig);

export async function outlookAuthCallback(
	req: Request<any, any, any, { code: string }>,
	res: Response
): Promise<void> {
	try {
		const { code } = req.query;
		if (!code) {
			throw new Error('Code not provided');
		}
		const tokenRequest: TokenRequest = {
			code,
			redirectUri: process.env.OUTLOOK_REDIRECT_URI || '',
			scopes: ['https://graph.microsoft.com/.default'],
			clientSecret: process.env.OUTLOOK_CLIENT_SECRET || '',
		};
		const authResult: AuthResult = await pca.acquireTokenByCode(tokenRequest);
		const accessToken: string = authResult.accessToken;
		// Convert session object to unknown first before casting to CustomSession
		const unknownSession: unknown = req.session;
		const customSession = unknownSession as CustomSession;
		customSession.accessToken = accessToken;
		res.redirect('/outlook/emails'); // Redirect to a route to fetch emails
	} catch (error) {
		console.error('Outlook Authentication Error:', error);
		res.status(500).send(error);
	}
}
