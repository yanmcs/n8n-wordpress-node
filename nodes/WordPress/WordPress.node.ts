import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType, // Added import
	ILoadOptionsFunctions,
	INodePropertyOptions, // Corrected typo
	NodeOperationError, // Added for better error handling
} from 'n8n-workflow';

// Placeholder for a generic API call function
// This would eventually be moved to a dedicated service class
async function wordpressApiRequest(
	this: ILoadOptionsFunctions | IExecuteFunctions,
	endpoint: string,
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
	body: object = {},
	qs: object = {}, // Query string parameters
): Promise<any> {
	const credentials = await this.getCredentials('wordPressApi');
	let itemIndexForError: number | undefined = undefined;
	if ('getItemIndex' in this && typeof this.getItemIndex === 'function') {
		itemIndexForError = this.getItemIndex();
	}

	if (!credentials || !credentials.baseUrl) {
		throw new NodeOperationError(this.getNode(), 'WordPress API credentials or Base URL not configured. Please check your credentials.', {
			itemIndex: itemIndexForError,
		});
	}
	const baseUrl = credentials.baseUrl as string;
	const apiUrl = `${baseUrl.replace(/\/$/, '')}/wp-json/wp/v2/${endpoint.replace(/^\//, '')}`;

	// Define common request options structure
	const requestOptions: any = { // Using 'any' for flexibility, will be specialized later
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		method,
		json: true,
		qs,
	};

	// Authentication - modifies requestOptions.headers
	if (credentials.authentication === 'basicAuth' || credentials.authentication === 'applicationPassword') {
		const username = credentials.username as string;
		const password = credentials.password as string;
		const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
		requestOptions.headers['Authorization'] = `Basic ${basicAuth}`;
	}
	// OAuth2 would require a different flow

	let processedBody = body;
	if (method !== 'GET' && Object.keys(body).length > 0) {
		processedBody = body;
	} else if (method !== 'GET') {
		processedBody = {};
	}

	// Use appropriate helper based on context
	if ('loadOptions' in this && this.helpers.request) {
		requestOptions.uri = apiUrl;
		if (method !== 'GET' && processedBody && Object.keys(processedBody).length > 0) {
			requestOptions.body = JSON.stringify(processedBody);
		} else if (method !== 'GET') {
			requestOptions.body = JSON.stringify({});
		}
		return this.helpers.request(requestOptions);

	} else if ('getNodeParameter' in this && this.helpers.httpRequest) {
		requestOptions.url = apiUrl;
		if (method !== 'GET' && processedBody) {
			requestOptions.body = processedBody;
		}
		return this.helpers.httpRequest(requestOptions);

	} else {
		if (endpoint === 'types' && method === 'GET' && 'loadOptions' in this) {
			console.warn('API request helper not available in loadOptions, using simulation for types.');
			return {
				post: { name: 'Posts', slug: 'post', rest_base: 'posts' },
				page: { name: 'Pages', slug: 'page', rest_base: 'pages' },
				media: { name: 'Media', slug: 'attachment', rest_base: 'media' },
				my_cpt: { name: 'My CPTs', slug: 'my_cpt', rest_base: 'my_cpts' },
			};
		}
		throw new NodeOperationError(this.getNode(), 'API request helper not available in the current context.', {
			itemIndex: itemIndexForError,
		});
	}
}


export class WordPress implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'WordPress Enhanced',
		name: 'wordPressEnhanced',
		icon: 'file:wordpress.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with WordPress API with enhanced capabilities',
		defaults: {
			name: 'WordPress Enhanced',
		},
		inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],
		credentials: [
			{
				name: 'wordPressApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				typeOptions: {
					loadOptionsMethod: 'getResourceOptions',
				},
				default: 'post',
				required: true,
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				options: [
					{ name: 'Create', value: 'create', action: 'Create a post or CPT item' },
					{ name: 'Read', value: 'read', action: 'Read posts or CPT items' },
					{ name: 'Update', value: 'update', action: 'Update a post or CPT item' },
					{ name: 'Delete', value: 'delete', action: 'Delete a post or CPT item' },
					{ name: 'Upload Media', value: 'mediaUpload', action: 'Upload a media file' },
					{ name: 'Read Media', value: 'mediaRead', action: 'Read media items' },
					{ name: 'Update Media', value: 'mediaUpdate', action: 'Update media item metadata' },
					{ name: 'Delete Media', value: 'mediaDelete', action: 'Delete a media item' },
					{ name: 'Create User', value: 'userCreate', action: 'Create a user' },
					{ name: 'Read Users', value: 'userRead', action: 'Read users' },
					{ name: 'Update User', value: 'userUpdate', action: 'Update a user' },
					{ name: 'Delete User', value: 'userDelete', action: 'Delete a user' },
				],
				default: 'create',
				noDataExpression: true,
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { '@operation': ['create', 'update'] } },
				description: 'Title of the post/CPT item',
			},
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 5 },
				default: '',
				displayOptions: { show: { '@operation': ['create', 'update'] } },
				description: 'Content of the post/CPT item',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Draft', value: 'draft' }, { name: 'Publish', value: 'publish' },
					{ name: 'Pending', value: 'pending' }, { name: 'Private', value: 'private' },
				],
				default: 'draft',
				displayOptions: { show: { '@operation': ['create', 'update'] } },
				description: 'Status of the post/CPT item',
			},
			{
				displayName: 'Post ID',
				name: 'postId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: { show: { '@operation': ['update', 'delete', 'mediaUpdate', 'mediaDelete'] } },
				description: 'ID of the item to update or delete',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 10,
				displayOptions: { show: { '@operation': ['read', 'mediaRead'] } },
				description: 'Max number of results to return',
			},
			{
				displayName: 'File Binary Property',
				name: 'fileBinaryProperty',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: { show: { '@resource': ['media'], '@operation': ['mediaUpload'] } },
				description: 'Name of the binary property that contains the file data to upload.',
			},
			{
				displayName: 'Media Title',
				name: 'mediaTitle',
				type: 'string',
				default: '',
				displayOptions: { show: { '@resource': ['media'], '@operation': ['mediaUpload', 'mediaUpdate'] } },
				description: 'Title for the media item.',
			},
			{
				displayName: 'Media Description',
				name: 'mediaDescription',
				type: 'string',
				default: '',
				displayOptions: { show: { '@resource': ['media'], '@operation': ['mediaUpload', 'mediaUpdate'] } },
				description: 'Description for the media item.',
			},
			{
				displayName: 'Media Caption',
				name: 'mediaCaption',
				type: 'string',
				default: '',
				displayOptions: { show: { '@resource': ['media'], '@operation': ['mediaUpload', 'mediaUpdate'] } },
				description: 'Caption for the media item.',
			},
			{
				displayName: 'Media Alt Text',
				name: 'mediaAltText',
				type: 'string',
				default: '',
				displayOptions: { show: { '@resource': ['media'], '@operation': ['mediaUpload', 'mediaUpdate'] } },
				description: 'Alternative text for the media item (for accessibility).',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: { show: { '@operation': ['create', 'read', 'update', 'mediaUpload', 'mediaRead', 'mediaUpdate'] } },
				options: [
					{ displayName: 'Status', name: 'status', type: 'multiOptions', options: [ { name: 'Publish', value: 'publish' }, { name: 'Future', value: 'future' }, { name: 'Draft', value: 'draft' }, { name: 'Pending', value: 'pending' }, { name: 'Private', value: 'private' }, { name: 'Trash', value: 'trash' }, { name: 'Auto-Draft', value: 'auto-draft' }, { name: 'Inherit', value: 'inherit' }, { name: 'Any', value: 'any' } ], default: [], description: 'Filter by post status. Default is publish.' },
					{ displayName: 'Order By', name: 'orderby', type: 'options', options: [ { name: 'Date', value: 'date' }, { name: 'ID', value: 'id' }, { name: 'Include', value: 'include' }, { name: 'Title', value: 'title' }, { name: 'Slug', value: 'slug' }, { name: 'Modified', value: 'modified' }, { name: 'Rand', value: 'rand' }, { name: 'Relevance', value: 'relevance' }, { name: 'Menu Order', value: 'menu_order' } ], default: 'date', description: 'Sort collection by post attribute' },
					{ displayName: 'Order', name: 'order', type: 'options', options: [ { name: 'Descending', value: 'desc' }, { name: 'Ascending', value: 'asc' } ], default: 'desc', description: 'Order sort attribute ascending or descending' },
					{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Limit results to those matching a string.' },
					{ displayName: 'Author IDs (comma-separated)', name: 'author', type: 'string', default: '', placeholder: '1,2,3', description: 'Limit result set to posts assigned to specific authors.' },
					{ displayName: 'Exclude Author IDs (comma-separated)', name: 'author_exclude', type: 'string', default: '', placeholder: '4,5', description: 'Ensure result set excludes posts assigned to specific authors.' },
					{ displayName: 'Category IDs (comma-separated)', name: 'categories', type: 'string', default: '', placeholder: '6,7', description: 'Limit result set to all items that have the specified term assigned in the categories taxonomy.' },
					{ displayName: 'Exclude Category IDs (comma-separated)', name: 'categories_exclude', type: 'string', default: '', placeholder: '8,9', description: 'Limit result set to all items that do not have the specified term assigned in the categories taxonomy.' },
					{ displayName: 'Tag IDs (comma-separated)', name: 'tags', type: 'string', default: '', placeholder: '10,11', description: 'Limit result set to all items that have the specified term assigned in the tags taxonomy.' },
					{ displayName: 'Exclude Tag IDs (comma-separated)', name: 'tags_exclude', type: 'string', default: '', placeholder: '12,13', description: 'Limit result set to all items that do not have the specified term assigned in the tags taxonomy.' },
					{ displayName: 'Slug', name: 'slug', type: 'string', default: '', description: 'Limit result set to posts with one or more specific slugs.' },
					{ displayName: 'Offset', name: 'offset', type: 'number', typeOptions: { minValue: 0 }, default: 0, description: 'Offset the result set by a specific number of items.' },
				],
				description: 'Additional options for querying posts or for create/update operations',
			},
			{
				displayName: 'Username (Login)', name: 'userUsername', type: 'string', required: true, displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate'] } }, default: '', description: 'The user`s login username.'
			},
			{
				displayName: 'Email', name: 'userEmail', type: 'string', required: true, displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate', 'userUpdate'] } }, default: '', description: 'The user`s email address.'
			},
			{
				displayName: 'Password', name: 'userPassword', type: 'string', typeOptions: { password: true }, required: true, displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate'] } }, default: '', description: 'User`s password (required for creation).'
			},
			{ displayName: 'First Name', name: 'userFirstName', type: 'string', default: '', displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate', 'userUpdate'] } } },
			{ displayName: 'Last Name', name: 'userLastName', type: 'string', default: '', displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate', 'userUpdate'] } } },
			{ displayName: 'Website', name: 'userUrl', type: 'string', default: '', displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate', 'userUpdate'] } }, description: 'URL of the user`s website.' },
			{ displayName: 'Nickname', name: 'userNickname', type: 'string', default: '', displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate', 'userUpdate'] } }, description: 'The user`s nickname. Defaults to the user`s username.' },
			{ displayName: 'Biographical Info', name: 'userDescription', type: 'string', typeOptions: { rows: 3 }, default: '', displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate', 'userUpdate'] } }, description: 'Biographical info for the user.' },
			{ displayName: 'Role', name: 'userRole', type: 'options', options: [ { name: 'Subscriber', value: 'subscriber' }, { name: 'Contributor', value: 'contributor' }, { name: 'Author', value: 'author' }, { name: 'Editor', value: 'editor' }, { name: 'Administrator', value: 'administrator' } ], default: 'subscriber', displayOptions: { show: { '@resource': ['user'], '@operation': ['userCreate', 'userUpdate'] } }, description: 'User role.' },
			{ displayName: 'User ID', name: 'userId', type: 'string', required: true, displayOptions: { show: { '@resource': ['user'], '@operation': ['userUpdate', 'userDelete'] } }, default: '', description: 'ID of the user to update or delete.' },
			{ displayName: 'Reassign Posts To (User ID)', name: 'userReassign', type: 'string', displayOptions: { show: { '@resource': ['user'], '@operation': ['userDelete'] } }, default: '', description: 'ID of the user to reassign posts and links to before deletion.' },
			{
				displayName: 'ACF Fields',
				name: 'acfFields',
				type: 'collection',
				placeholder: 'Add ACF Field',
				default: {},
				displayOptions: { show: { '@operation': ['create', 'update'] } },
				description: 'Advanced Custom Fields to set for the item.',
				options: [
					{
						displayName: 'Field Name (Key)',
						name: 'key',
						type: 'options', // Changed from string
						default: '',
						description: 'Name of the ACF field (its key/slug). Select or type.',
						typeOptions: {
							loadOptionsMethod: 'getAcfFieldKeys',
						},
					},
					{
						displayName: 'Field Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value for the ACF field. For complex fields (arrays, objects), use JSON string.',
						typeOptions: { rows: 2 },
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getResourceOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const returnOptions: INodePropertyOptions[] = [
					{ name: 'Post', value: 'post' }, { name: 'Media', value: 'media' },
					{ name: 'User', value: 'user' }, { name: 'Page', value: 'page' },
				];
				try {
					const credentials = await this.getCredentials('wordPressApi');
					if (!credentials || !credentials.baseUrl) {
						console.warn("WordPress API credentials or Base URL not configured for getResourceOptions.");
						return returnOptions;
					}
					const types = await wordpressApiRequest.call(this, 'types');
					for (const typeKey in types) {
						if (types.hasOwnProperty(typeKey)) {
							const typeDetails = types[typeKey];
							const valueForOption = typeDetails.rest_base || typeDetails.slug;
							if (!returnOptions.some(opt => opt.value === valueForOption)) {
								returnOptions.push({ name: typeDetails.name, value: valueForOption });
							}
						}
					}
				} catch (error) {
					console.error("Failed to load dynamic post types:", error);
				}
				return returnOptions;
			},
			async getAcfFieldKeys(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const resourceSlug = this.getCurrentNodeParameter('resource') as string;
				const returnOptions: INodePropertyOptions[] = [];
				const isPostLikeType = !['media', 'user'].includes(resourceSlug);
				if (!isPostLikeType || !resourceSlug) {
					return [{ name: 'N/A for this resource or no resource selected', value: '' }];
				}
				try {
					// Placeholder for actual ACF field fetching logic
					if (resourceSlug === 'post' || resourceSlug === 'posts') { // 'posts' is the rest_base for 'post'
						returnOptions.push({ name: 'Text Field (text_field)', value: 'text_field' });
						returnOptions.push({ name: 'Image Field (image_field)', value: 'image_field' });
						returnOptions.push({ name: 'Repeater Field (repeater_field)', value: 'repeater_field' });
					} else {
						// For other CPTs, this would make a real API call.
						// For now, return a message indicating dynamic loading would occur.
						// And add a few generic examples
						returnOptions.push({ name: `(ACF Fields for ${resourceSlug} - dynamic)`, value: '' });
						returnOptions.push({ name: 'Example Custom Field 1 (example_field_1)', value: 'example_field_1' });
						returnOptions.push({ name: 'Example Custom Field 2 (example_field_2)', value: 'example_field_2' });
					}
				} catch (error) {
					console.error(`Failed to load ACF field keys for resource ${resourceSlug}:`, error);
					returnOptions.push({ name: 'Error loading ACF fields', value: '' });
				}
				if (returnOptions.length === 0 && isPostLikeType) { // Ensure some options if post-like and no error
					returnOptions.push({ name: 'No ACF fields found or load failed for this type', value: '' });
				}
				return returnOptions;
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		let responseData;
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resourceSlug = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const isPostLikeType = !['media', 'user'].includes(resourceSlug);

				if (isPostLikeType) {
					const endpointBase = resourceSlug;
					if (operation === 'read') {
						const limit = this.getNodeParameter('limit', i, 10) as number;
						const optionsParam = this.getNodeParameter('options', i, {}) as { qs?: Record<string, any> };
						const queryParameters: Record<string, any> = { per_page: limit, context: 'view', ...optionsParam.qs };
						for (const key in queryParameters) { if (Array.isArray(queryParameters[key])) queryParameters[key] = queryParameters[key].join(','); }
						responseData = await wordpressApiRequest.call(this, endpointBase, 'GET', {}, queryParameters);
					} else if (operation === 'create') {
						const title = this.getNodeParameter('title', i) as string;
						const content = this.getNodeParameter('content', i, '') as string;
						const status = this.getNodeParameter('status', i, 'draft') as string;
						const optionsParam = this.getNodeParameter('options', i, {}) as { body?: Record<string, any> };
						const acfFieldsParam = this.getNodeParameter('acfFields', i, {}) as { values?: Array<{ key: string, value: any }> }; // Default to empty object for collection
						const body: Record<string, any> = { title, content, status, ...optionsParam.body };
						if (acfFieldsParam.values && acfFieldsParam.values.length > 0) {
							body.acf = acfFieldsParam.values.reduce((obj, item) => {
								try { obj[item.key] = JSON.parse(item.value); } catch (e) { obj[item.key] = item.value; }
								return obj;
							}, {} as Record<string, any>);
						}
						responseData = await wordpressApiRequest.call(this, endpointBase, 'POST', body);
					} else if (operation === 'update') {
						const itemId = this.getNodeParameter('postId', i) as string;
						if (!itemId) throw new Error('Item ID is required for update operation.');
						const title = this.getNodeParameter('title', i, undefined) as string | undefined;
						const content = this.getNodeParameter('content', i, undefined) as string | undefined;
						const status = this.getNodeParameter('status', i, undefined) as string | undefined;
						const optionsParam = this.getNodeParameter('options', i, {}) as { body?: Record<string, any> };
						const acfFieldsParam = this.getNodeParameter('acfFields', i, {}) as { values?: Array<{ key: string, value: any }> };
						const body: Record<string, any> = { ...optionsParam.body };
						if (title !== undefined) body.title = title;
						if (content !== undefined) body.content = content;
						if (status !== undefined) body.status = status;
						if (acfFieldsParam.values && acfFieldsParam.values.length > 0) {
							body.acf = acfFieldsParam.values.reduce((obj, item) => {
								try { obj[item.key] = JSON.parse(item.value); } catch (e) { obj[item.key] = item.value; }
								return obj;
							}, {} as Record<string, any>);
						}
						responseData = await wordpressApiRequest.call(this, `${endpointBase}/${itemId}`, 'POST', body);
					} else if (operation === 'delete') {
						const itemId = this.getNodeParameter('postId', i) as string;
						if (!itemId) throw new Error('Item ID is required for delete operation.');
						responseData = await wordpressApiRequest.call(this, `${endpointBase}/${itemId}`, 'DELETE', {}, { force: true });
					}
				} else if (resourceSlug === 'media') {
					const mediaRestBase = 'media';
					if (operation === 'mediaUpload') {
						const binaryPropertyName = this.getNodeParameter('fileBinaryProperty', i) as string;
						const item = items[i];
						if (item.binary === undefined || item.binary[binaryPropertyName] === undefined) {
							throw new Error(`No binary data found in property '${binaryPropertyName}' for item ${i}.`);
						}
						const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
						const fileName = item.binary[binaryPropertyName].fileName || 'upload.bin';
						const mimeType = item.binary[binaryPropertyName].mimeType;
						const mediaTitle = this.getNodeParameter('mediaTitle', i, fileName) as string;
						const mediaDescription = this.getNodeParameter('mediaDescription', i, undefined) as string | undefined;
						const mediaCaption = this.getNodeParameter('mediaCaption', i, undefined) as string | undefined;
						const mediaAltText = this.getNodeParameter('mediaAltText', i, undefined) as string | undefined;
						const optionsParam = this.getNodeParameter('options', i, {}) as { body?: Record<string, any> };
						const headers: Record<string, string> = { 'Content-Disposition': `attachment; filename="${fileName}"` };
						if (mimeType) headers['Content-Type'] = mimeType;
						const credentials = await this.getCredentials('wordPressApi');
						if (credentials.authentication === 'basicAuth' || credentials.authentication === 'applicationPassword') {
							const basicAuth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
							headers['Authorization'] = `Basic ${basicAuth}`;
						}
						const fullUrl = `${(credentials.baseUrl as string).replace(/\/$/, '')}/wp-json/wp/v2/${mediaRestBase.replace(/^\//, '')}`;
						responseData = await this.helpers.httpRequest({ method: 'POST', url: fullUrl, headers: headers, body: binaryData });
						if (responseData && responseData.id) {
							const mediaId = responseData.id;
							const metadataToUpdate: Record<string, any> = {};
							if (mediaTitle && mediaTitle !== fileName) metadataToUpdate.title = mediaTitle;
							if (mediaDescription) metadataToUpdate.description = mediaDescription;
							if (mediaCaption) metadataToUpdate.caption = mediaCaption;
							if (mediaAltText) metadataToUpdate.alt_text = mediaAltText;
							if (optionsParam.body) { for(const key in optionsParam.body) { if(optionsParam.body.hasOwnProperty(key) && metadataToUpdate[key] === undefined) metadataToUpdate[key] = optionsParam.body[key]; } }
							if (Object.keys(metadataToUpdate).length > 0) {
								await wordpressApiRequest.call(this, `${mediaRestBase}/${mediaId}`, 'POST', metadataToUpdate);
								responseData = await wordpressApiRequest.call(this, `${mediaRestBase}/${mediaId}`, 'GET');
							}
						}
					} else if (operation === 'mediaRead') {
						const limit = this.getNodeParameter('limit', i, 10) as number;
						const optionsParam = this.getNodeParameter('options', i, {}) as { qs?: Record<string, any> };
						const queryParameters: Record<string, any> = { per_page: limit, context: 'view', ...optionsParam.qs };
						for (const key in queryParameters) { if (Array.isArray(queryParameters[key])) queryParameters[key] = queryParameters[key].join(','); }
						responseData = await wordpressApiRequest.call(this, mediaRestBase, 'GET', {}, queryParameters);
					} else if (operation === 'mediaUpdate') {
						const itemId = this.getNodeParameter('postId', i) as string;
						if (!itemId) throw new Error('Media ID is required for update operation.');
						const mediaTitle = this.getNodeParameter('mediaTitle', i, undefined) as string|undefined;
						const mediaDescription = this.getNodeParameter('mediaDescription', i, undefined) as string | undefined;
						const mediaCaption = this.getNodeParameter('mediaCaption', i, undefined) as string | undefined;
						const mediaAltText = this.getNodeParameter('mediaAltText', i, undefined) as string | undefined;
						const optionsParam = this.getNodeParameter('options', i, {}) as { body?: Record<string, any> };
						const body: Record<string, any> = { ...optionsParam.body };
						if (mediaTitle !== undefined) body.title = mediaTitle;
						if (mediaDescription !== undefined) body.description = mediaDescription;
						if (mediaCaption !== undefined) body.caption = mediaCaption;
						if (mediaAltText !== undefined) body.alt_text = mediaAltText;
						responseData = await wordpressApiRequest.call(this, `${mediaRestBase}/${itemId}`, 'POST', body);
					} else if (operation === 'mediaDelete') {
						const itemId = this.getNodeParameter('postId', i) as string;
						if (!itemId) throw new Error('Media ID is required for delete operation.');
						responseData = await wordpressApiRequest.call(this, `${mediaRestBase}/${itemId}`, 'DELETE', {}, { force: true });
					} else if (['create', 'read', 'update', 'delete'].includes(operation) && !isPostLikeType) {
						throw new Error(`Operation '${operation}' is for post-like types and not directly applicable to '${resourceSlug}'. Please select a media-specific operation.`);
					} else {
						throw new Error(`Operation '${operation}' not supported for resource '${resourceSlug}' yet.`);
					}
				} else if (resourceSlug === 'user') {
					const userRestBase = 'users';
					if (operation === 'userCreate') {
						const username = this.getNodeParameter('userUsername', i) as string;
						const email = this.getNodeParameter('userEmail', i) as string;
						const password = this.getNodeParameter('userPassword', i) as string;
						const firstName = this.getNodeParameter('userFirstName', i, '') as string;
						const lastName = this.getNodeParameter('userLastName', i, '') as string;
						const nickname = this.getNodeParameter('userNickname', i, '') as string;
						const url = this.getNodeParameter('userUrl', i, '') as string;
						const description = this.getNodeParameter('userDescription', i, '') as string;
						const role = this.getNodeParameter('userRole', i, 'subscriber') as string;
						const optionsParam = this.getNodeParameter('options', i, {}) as { body?: Record<string, any> };
						const body: Record<string, any> = { username, email, password, first_name: firstName, last_name: lastName, nickname, url, description, roles: [role], ...optionsParam.body };
						responseData = await wordpressApiRequest.call(this, userRestBase, 'POST', body);
					} else if (operation === 'userRead') {
						const limit = this.getNodeParameter('limit', i, 10) as number;
						const optionsParam = this.getNodeParameter('options', i, {}) as { qs?: Record<string, any> };
						const queryParameters: Record<string, any> = { per_page: limit, context: 'view', ...optionsParam.qs };
						for (const key in queryParameters) { if (Array.isArray(queryParameters[key])) queryParameters[key] = queryParameters[key].join(','); }
						responseData = await wordpressApiRequest.call(this, userRestBase, 'GET', {}, queryParameters);
					} else if (operation === 'userUpdate') {
						const userId = this.getNodeParameter('userId', i) as string;
						if (!userId) throw new Error('User ID is required for update operation.');
						const email = this.getNodeParameter('userEmail', i, undefined) as string | undefined;
						const firstName = this.getNodeParameter('userFirstName', i, undefined) as string | undefined;
						const lastName = this.getNodeParameter('userLastName', i, undefined) as string | undefined;
						const nickname = this.getNodeParameter('userNickname', i, undefined) as string | undefined;
						const url = this.getNodeParameter('userUrl', i, undefined) as string | undefined;
						const description = this.getNodeParameter('userDescription', i, undefined) as string | undefined;
						const role = this.getNodeParameter('userRole', i, undefined) as string | undefined;
						const optionsParam = this.getNodeParameter('options', i, {}) as { body?: Record<string, any> };
						const body: Record<string, any> = { ...optionsParam.body };
						if (email) body.email = email;
						if (firstName) body.first_name = firstName;
						if (lastName) body.last_name = lastName;
						if (nickname) body.nickname = nickname;
						if (url) body.url = url;
						if (description) body.description = description;
						if (role) body.roles = [role];
						responseData = await wordpressApiRequest.call(this, `${userRestBase}/${userId}`, 'POST', body);
					} else if (operation === 'userDelete') {
						const userId = this.getNodeParameter('userId', i) as string;
						if (!userId) throw new Error('User ID is required for delete operation.');
						const reassignId = this.getNodeParameter('userReassign', i, undefined) as string | undefined;
						const deleteParams: Record<string, any> = { force: true };
						if (reassignId) deleteParams.reassign = reassignId;
						responseData = await wordpressApiRequest.call(this, `${userRestBase}/${userId}`, 'DELETE', {}, deleteParams);
					} else if (['create', 'read', 'update', 'delete'].includes(operation) && resourceSlug !== 'user') {
						throw new Error(`Operation '${operation}' is for post-like types and not directly applicable to '${resourceSlug}'. Please select a user-specific operation.`);
					} else {
						throw new Error(`Operation '${operation}' not supported for resource '${resourceSlug}' yet.`);
					}
				} else {
					throw new Error(`Resource '${resourceSlug}' not supported yet.`);
				}

				if (Array.isArray(responseData)) {
					returnData.push(...this.helpers.returnJsonArray(responseData));
				} else if (responseData) {
					returnData.push(this.helpers.returnJsonArray([responseData])[0]);
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, error });
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}
