import { Client } from '@microsoft/microsoft-graph-client';

export const InitializeClient = (accessToken: string) => {
	const client = Client.init({
		authProvider: (done) => {
			done(null, accessToken);
		},
	});
	return client;
};

export async function getOutlookEmails(accessToken: string): Promise<any[]> {
	try {
		const client = InitializeClient(accessToken);
		const messages = await client.api('/me/messages').get();
		return messages.value || [];
	} catch (error: any) {
		console.log('Service', error);
		throw new Error('Failed to fetch Outlook emails: ' + error.message);
	}
}
