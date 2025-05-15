import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class WordPressApi implements ICredentialType {
	name = 'wordPressApi';
	displayName = 'WordPress API';
	documentationUrl = 'https://developer.wordpress.org/rest-api/authentication/'; // Generic WP REST API auth docs
	properties: INodeProperties[] = [
		{
			displayName: 'WordPress Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://example.com',
			description: 'The base URL of your WordPress installation (e.g., https://yourdomain.com)',
			required: true,
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'options',
			options: [
				{
					name: 'Basic Auth',
					value: 'basicAuth',
				},
				{
					name: 'OAuth2',
					value: 'oauth2',
				},
				{
					name: 'Application Password',
					value: 'applicationPassword',
				},
			],
			default: 'basicAuth',
			description: 'Authentication method to use',
		},
		// Basic Auth Properties
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authentication: ['basicAuth'],
				},
			},
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authentication: ['basicAuth', 'applicationPassword'], // App Passwords use username + app password
				},
			},
			required: true,
		},
		// Application Password Specific Note (handled by username/password fields)
		// For Application Passwords, the 'Username' field should be the WordPress username,
		// and the 'Password' field should be the generated Application Password.

		// OAuth2 Properties (Placeholders - n8n has a more complex setup for OAuth2)
		// These would typically be more involved, often requiring a separate credential type or more complex configuration.
		// For now, these are simplified placeholders.
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			displayOptions: {
				show: {
					authentication: ['oauth2'],
				},
			},
			// required: true, // OAuth2 setup is more complex
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			displayOptions: {
				show: {
					authentication: ['oauth2'],
				},
			},
			// required: true,
		},
		// Potentially Access Token, Refresh Token, Auth URL, Token URL for full OAuth2
	];
}
