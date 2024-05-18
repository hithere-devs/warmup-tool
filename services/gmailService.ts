// src/services/gmailService.ts

import { google } from 'googleapis';
import { generateOAuthClient } from '../utils/oauth';

export async function getGmailEmails(tokens: any): Promise<any[]> {
	const oAuth2Client = await generateOAuthClient({
		clientId: process.env.GMAIL_CLIENT_ID || '',
		clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
		redirectUri: process.env.GMAIL_REDIRECT_URI || '',
	});
	oAuth2Client.setCredentials(tokens);
	const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

	const response = await gmail.users.messages.list({
		userId: 'me',
		q: 'is:unread',
	});

	const emails = response.data.messages || [];
	const emailPromises = emails.map(async (message: any) => {
		const emailResponse = await gmail.users.messages.get({
			userId: 'me',
			id: message.id,
			format: 'metadata',
			metadataHeaders: ['To', 'Subject', 'From', 'Body'],
		});
		return emailResponse.data;
	});

	return Promise.all(emailPromises);
}
