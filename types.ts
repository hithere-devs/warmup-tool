// types.ts

export interface TokenRequest {
	code: string;
	redirectUri: string;
	scopes: string[];
	clientSecret: string;
}

export interface AuthResult {
	accessToken: string;
}

export interface OutlookAuthCallbackRequest {
	query: {
		code: string;
	};
}

export interface OutlookAuthCallbackResponse {
	session: {
		accessToken: string;
	};
}

export interface CustomSession {
	accessToken: string; // Define the accessToken property
	gmailAccessToken: string;
}
