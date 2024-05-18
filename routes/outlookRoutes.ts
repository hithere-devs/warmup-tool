import express, { Request, Response } from 'express';
import { processQueue } from '../services/jobService';
import { repeat } from '..';

declare module 'express-session' {
	interface Session {
		gmailAccessToken?: string; // Define the property on the Session interface
		accessToken?: string;
	}
}

const router = express.Router();

router.get('/emails', async (req: Request, res: Response) => {
	try {
		const { accessToken } = req.session;
		if (!accessToken) {
			throw new Error('Gmail access token not found in session');
		}

		// start the job here ...
		processQueue.add(
			'fetchEmails',
			{
				method: 'OUTLOOK',
				accessToken: accessToken,
			},
			{
				repeat: repeat,
			}
		);

		res.status(200).json('Your emails have been queued for processing');
	} catch (error) {
		console.error('Error fetching Outlook emails:', error);
		res.status(500).json({ error: 'Failed to fetch Outlook emails' });
	}
});

export default router;
