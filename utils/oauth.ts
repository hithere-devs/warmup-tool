import { google } from 'googleapis';

interface OAuthCredentials {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}

interface Payload {
	state: string;
	scopes: string[];
}

const generateOAuthClient = (oAuthCredentials: OAuthCredentials): any => {
	const { clientId, clientSecret, redirectUri } = oAuthCredentials;
	const oAuth2Client = new google.auth.OAuth2(
		clientId,
		clientSecret,
		redirectUri
	);

	return oAuth2Client;
};

const generateAuthCred = (oAuth2Client: any, token: string) => {
	oAuth2Client.setCredentials({ access_token: token });
	const oAuth2 = google.oauth2({
		auth: oAuth2Client,
		version: 'v2',
	});
	return oAuth2;
};

const generateOAuthUrl = (
	payload: Payload,
	oAuthCredentials: OAuthCredentials
): string => {
	const { state, scopes } = payload;

	const oAuth2Client = generateOAuthClient(oAuthCredentials);

	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: scopes,
		state,
	});

	return authUrl;
};

export { generateOAuthClient, generateOAuthUrl, generateAuthCred };
