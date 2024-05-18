import { Queue, Worker } from 'bullmq';
import OpenAI from 'openai';
import IORedis from 'ioredis';
import { getOutlookEmails, InitializeClient } from './outlookService';
import { generateOAuthClient } from '../utils/oauth';
import { google } from 'googleapis';
import { getGmailEmails } from './gmailService';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || '',
	dangerouslyAllowBrowser: true,
});

export const redisConnection = new IORedis({
	host: '127.0.0.1',
	port: 6379,
	maxRetriesPerRequest: null,
});

// Create a queue for email processing
export const emailQueue = new Queue('emailQueue', {
	connection: redisConnection,
});

export const processQueue = new Queue('processQueue', {
	connection: redisConnection,
});

// Define a worker to process the emails
const emailWorker = new Worker(
	'emailQueue',
	async (job) => {
		const { email, accessToken, id } = job.data;

		// Categorize the email based on subject and body using openai
		const response: GPTResponse = await categorizeEmailAndGenerateReply(email);

		// Send the generated reply to the email
		sendReply(email, response, accessToken, id);
	},
	{
		connection: redisConnection,
	}
);

const fetchEmails = new Worker(
	'processQueue',
	async (job) => {
		const { method, accessToken } = job.data;
		if (method == 'GMAIL') {
			const emails = await getGmailEmails(accessToken);
			console.log('No of Gmail Emails Processed', emails.length);
			// Send the emails fetched here to the email queue setup
			emails.forEach((email) => {
				const { headers } = email.payload;

				const data = {
					subject: headers.find((header: any) => header.name === 'Subject')
						.value,
					body: email.snippet,
					senderEmail: headers.find((header: any) => header.name === 'From')
						.value,
					receivingEmail: headers.find((header: any) => header.name === 'To')
						.value,
					connection: 'GMAIL',
				};
				emailQueue.add('processEmail', {
					email: data,
					accessToken: accessToken,
					id: email.id,
				});
			});
		}
		if (method == 'OUTLOOK') {
			const emails = await getOutlookEmails(accessToken);
			console.log('No of Outlook Emails Processed', emails.length);
			// Send the emails fetched here to the email queue setup
			emails.forEach((email) => {
				if (!email.isRead) {
					const data = {
						subject: email.subject,
						body: email.bodyPreview,
						senderEmail: email.sender.emailAddress.address,
						receivingEmail: email.toRecipients[0].emailAddress.address,
						connection: method,
					};
					emailQueue.add('processEmail', {
						email: data,
						accessToken: accessToken,
						id: email.id,
					});
				}
			});
		}
	},
	{
		connection: redisConnection, // Pass Redis connection to worker
	}
);

// Function to categorize the email and generate a suitable reply using openai
async function categorizeEmailAndGenerateReply(
	email: Email
): Promise<GPTResponse> {
	// TODO: Implement the logic to categorize the email using openai
	// Return the category (e.g., 'Interested', 'Not Interested', 'More Information')
	const response = await openai.chat.completions.create({
		messages: [
			{
				role: 'system',
				content: `You are building an AI tool to categorize and respond to emails automatically. The tool should categorize incoming emails into one of the following categories: "Interested", "Not Interested", or "More Information".
				
				If an email indicates interest in the product or service and requests further details such as pricing or a demo, categorize it as "Interested". If the email explicitly states disinterest or mentions that the product is not relevant, categorize it as "Not Interested". If the email expresses interest but seeks additional information like a free trial or demonstration, categorize it as "More Information".
				
				Your task is to develop the logic for categorizing incoming emails and generating suitable replies based on their categorization.
				
				Please provide your response in the following JSON format:

				{
					"label": "",
					"reply": {
						"subject": "",
						"body": ""
					}
				}

				For example:
				If the email content indicates interest and requests a demo, the tool should generate a reply asking the sender if they are willing to schedule a demo call.

				Your response:
				{
					"label": "Interested",
					"reply": {
						"subject": "Schedule a Demo Call",
						"body": "Hello! Thank you for reaching out. We're glad to hear you're interested in our product. Could you please let us know your availability for a demo call?"
					}
				}

				The actual email content: \n
				${email}`,
			},
		],
		model: 'gpt-3.5-turbo',
	});
	//   return response.choices[0].message.content;
	const data = response.choices[0].message.content;
	let obj;
	if (data) {
		obj = JSON.parse(data);
	}
	obj.email = email;
	// return this obj
	return obj;
}

// Function to send the reply to the email
function sendReply(
	email: Email,
	reply: GPTResponse,
	accessToken: string,
	id: string
): void {
	// TODO: Implement the logic to send the reply to the email
	if (email.connection == 'OUTLOOK') {
		// send a reply via OUTLOOK reply method
		const replyEmail = {
			message: {
				subject: reply.reply.subject,
				body: {
					contentType: 'Text',
					content: reply.reply.body,
				},
				toRecipients: [
					{
						emailAddress: {
							address: email.senderEmail,
						},
					},
				],
			},
			saveToSentItems: 'true',
		};
		sendReplyViaOutlook(replyEmail, accessToken, id, reply.label);
	}
	if (email.connection == 'GMAIL') {
		// send a reply via GMAIL reply method
		const emailRegex = /<([^>]+)>/;

		const extractEmail = emailRegex.exec(email.senderEmail);
		const replyTo = extractEmail && extractEmail[1] ? extractEmail[1] : null;
		if (!replyTo) {
			console.log('Sender email not found');
			return;
		}
		const replySubject = email.subject.startsWith('Re: ')
			? email.subject
			: `Re: ${email.subject}`;
		const replyBody = reply.reply.body;

		const messageFormat = [
			`From: me`,
			`To: ${replyTo}`,
			`Subject: ${replySubject}`,
			`In-Reply-To: ${id}`,
			`References: ${id}`,
			'',
			replyBody,
		].join('\n');
		sendReplyViaGmail(messageFormat, accessToken, id, reply.label);
	}
}

async function sendReplyViaOutlook(
	message: SendingBody,
	accessToken: string,
	id: string,
	label: string
) {
	try {
		const client = InitializeClient(accessToken);
		await client.api('/me/sendMail').post(message);
		await client
			.api(`/me/messages/${id}`)
			.patch({ isRead: true, categories: [label] });
	} catch (error: any) {
		console.log(error);
	}
}

async function sendReplyViaGmail(
	message: string,
	accessToken: string,
	id: string,
	label: string
) {
	try {
		const oAuth2Client = await generateOAuthClient({
			clientId: process.env.GMAIL_CLIENT_ID || '',
			clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
			redirectUri: process.env.GMAIL_REDIRECT_URI || '',
		});
		oAuth2Client.setCredentials(accessToken);
		const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

		const encodedMessage = Buffer.from(message)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
		await gmail.users.messages.send({
			userId: 'me',
			requestBody: {
				raw: encodedMessage,
			},
		});

		const labelData = await gmail.users.labels.list({
			userId: 'me',
		});
		const correctlabel = labelData.data.labels?.find(
			(item) => item.name === label
		);
		let labelId: string = '';
		if (!correctlabel) {
			const newLabel = await gmail.users.labels.create({
				userId: 'me',
				requestBody: {
					name: label,
				},
			});
			if (newLabel.data.id) labelId = newLabel.data.id;
		}
		if (correctlabel?.id) labelId = correctlabel.id;

		await gmail.users.messages.modify({
			userId: 'me',
			id: id,
			requestBody: {
				removeLabelIds: ['INBOX', 'UNREAD'],
				addLabelIds: [labelId],
			},
		});
	} catch (error) {
		console.log(error);
	}
}

interface Email {
	subject: string;
	body: string;
	senderEmail: string;
	receivingEmail: string;
	connection: 'OUTLOOK' | 'GMAIL';
}

interface GPTResponse {
	label: string;
	reply: {
		subject: string;
		body: string;
	};
	email: Email;
}

interface EmailAddress {
	address: string;
}

interface ToRecipient {
	emailAddress: EmailAddress;
}

interface EmailMessage {
	subject: string;
	body: {
		contentType: string;
		content: string;
	};
	toRecipients: ToRecipient[];
}

interface SendingBody {
	message: EmailMessage;
	saveToSentItems: string;
}
