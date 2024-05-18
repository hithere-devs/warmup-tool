import express from 'express';
import {
	googleAuthCallback,
	outlookAuthCallback,
} from '../controllers/authController';
import { generateOAuthUrl } from '../utils/oauth';
import { redisConnection } from '../services/jobService';

const router = express.Router();

router.get('/auth/google', async (req, res) => {
	const oAuthCredentials = {
		clientId: process.env.GMAIL_CLIENT_ID || '',
		clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
		redirectUri: process.env.GMAIL_REDIRECT_URI || '',
	};
	const scopes = [
		'https://www.googleapis.com/auth/gmail.readonly',
		'https://www.googleapis.com/auth/gmail.send',
		'https://www.googleapis.com/auth/gmail.labels',
		'https://mail.google.com/',
	];
	const oAuthConfig = {
		state: '',
		scopes,
	};
	const authUrl = generateOAuthUrl(oAuthConfig, oAuthCredentials);
	res.redirect(authUrl);
});

router.get('/oauth2callback', googleAuthCallback);

router.get('/auth/outlook', (req, res) => {
	res.redirect(
		`https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/authorize?client_id=${process.env.OUTLOOK_CLIENT_ID}&response_type=code&redirect_uri=${process.env.OUTLOOK_REDIRECT_URI}&scope=openid%20offline_access%20https://graph.microsoft.com/.default`
	);
});

router.get('/auth/outlook/callback', outlookAuthCallback);

router.get('/auth/logout', (req, res) => {
	redisConnection
		.flushdb()
		.then(() => {
			console.log('Logged Out and Redis database cleared successfully.');
			res.send('Logged Out and Redis database cleared successfully.');
		})
		.catch((error) => {
			console.error('Error clearing Redis database:', error);
			res.send(error);
		});
});

export default router;
