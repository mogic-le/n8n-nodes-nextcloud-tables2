import { INodeProperties } from 'n8n-workflow';

export const viewOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['view'],
			},
		},
		options: [
			{
				name: 'Alle Views Abrufen',
				value: 'getAll',
				description: 'Alle Views einer Tabelle abrufen',
				action: 'Alle Views abrufen',
			},
			{
				name: 'View Abrufen',
				value: 'get',
				description: 'Eine spezifische View abrufen',
				action: 'View abrufen',
			},
			{
				name: 'View Erstellen',
				value: 'create',
				description: 'Eine neue View erstellen',
				action: 'View erstellen',
			},
			{
				name: 'View Erstellen (KI-Friendly)',
				value: 'createAIFriendly',
				description: 'Eine neue View erstellen - optimiert für KI Agents',
				action: 'View erstellen (KI-Friendly)',
			},
			{
				name: 'View Aktualisieren',
				value: 'update',
				description: 'Eine View aktualisieren',
				action: 'View aktualisieren',
			},
			{
				name: 'View Aktualisieren (KI-Friendly)',
				value: 'updateAIFriendly',
				description: 'Eine View aktualisieren - optimiert für KI Agents',
				action: 'View aktualisieren (KI-Friendly)',
			},
			{
				name: 'View Löschen',
				value: 'delete',
				description: 'Eine View löschen',
				action: 'View löschen',
			},
		],
		default: 'getAll',
	},
];

export const viewFields: INodeProperties[] = [
	// ==============================================
	// KI-FRIENDLY OPERATIONS - Alle Parameter verfügbar
	// ==============================================

	// View-Konfiguration für AI-Friendly create
	{
		displayName: 'View-Konfiguration (AI-Friendly)',
		name: 'viewConfig',
		type: 'fixedCollection',
		required: true,
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['createAIFriendly'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Basis-Konfiguration',
				name: 'basic',
				values: [
					{
						displayName: 'Titel',
						name: 'title',
						type: 'string',
						required: true,
						default: '',
						description: 'Der Titel der neuen View',
						placeholder: 'Meine View',
					},
					{
						displayName: 'Tabellen-ID',
						name: 'tableId',
						type: 'string',
						required: true,
						default: '',
						description: 'Die ID der Tabelle für die View',
						placeholder: '123',
					},
					{
						displayName: 'Emoji',
						name: 'emoji',
						type: 'string',
						default: '',
						description: 'Ein optionales Emoji für die View',
						placeholder: '🔍',
					},
					{
						displayName: 'Beschreibung',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Eine optionale Beschreibung für die View',
						placeholder: 'Beschreibung der View...',
					},
				],
			},
		],
		description: 'Basis-Konfiguration für die neue View',
	},

	// Update-Konfiguration für AI-Friendly update
	{
		displayName: 'Update-Konfiguration (AI-Friendly)',
		name: 'updateConfig',
		type: 'fixedCollection',
		required: true,
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['updateAIFriendly'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Update-Daten',
				name: 'data',
				values: [
					{
						displayName: 'View-ID',
						name: 'viewId',
						type: 'string',
						required: true,
						default: '',
						description: 'Die ID der zu aktualisierenden View',
						placeholder: '456',
					},
					{
						displayName: 'Neuer Titel',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Der neue Titel der View (leer lassen = nicht ändern)',
						placeholder: 'Neuer View-Name',
					},
					{
						displayName: 'Neues Emoji',
						name: 'emoji',
						type: 'string',
						default: '',
						description: 'Das neue Emoji für die View (leer lassen = nicht ändern)',
						placeholder: '🔍',
					},
					{
						displayName: 'Neue Beschreibung',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Die neue Beschreibung der View (leer lassen = nicht ändern)',
						placeholder: 'Neue Beschreibung...',
					},
				],
			},
		],
		description: 'Update-Konfiguration für die View',
	},

	// Filter-Konfiguration für AI-Friendly Operationen
	{
		displayName: 'Filter-Konfiguration (AI-Friendly)',
		name: 'filterConfig',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Filter-Regeln',
				name: 'rules',
				values: [
					{
						displayName: 'Filter',
						name: 'filters',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						placeholder: 'Filter hinzufügen',
						default: {},
						options: [
							{
								displayName: 'Filter-Regel',
								name: 'filter',
								values: [
									{
										displayName: 'Spalten-ID',
										name: 'columnId',
										type: 'string',
										required: true,
										default: '',
										description: 'Die ID der zu filternden Spalte',
										placeholder: '1',
									},
									{
										displayName: 'Operator',
										name: 'operator',
										type: 'string',
										default: 'EQ',
										description: 'Der Filter-Operator. Gültige Werte: "EQ" (gleich), "NEQ" (ungleich), "GT" (größer), "GTE" (größer gleich), "LT" (kleiner), "LTE" (kleiner gleich), "LIKE" (enthält)',
										placeholder: 'EQ',
									},
									{
										displayName: 'Wert',
										name: 'value',
										type: 'string',
										default: '',
										description: 'Der Filter-Wert',
										placeholder: 'Filter-Wert...',
									},
								],
							},
						],
						description: 'Die Filter-Regeln für die View',
					},
				],
			},
		],
		description: 'Filter-Konfiguration für die View',
	},

	// Sortierung-Konfiguration für AI-Friendly Operationen
	{
		displayName: 'Sortierungs-Konfiguration (AI-Friendly)',
		name: 'sortConfig',
		type: 'fixedCollection',
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Sortier-Regeln',
				name: 'rules',
				values: [
					{
						displayName: 'Sortierung',
						name: 'sorting',
						type: 'fixedCollection',
						typeOptions: {
							multipleValues: true,
						},
						placeholder: 'Sortierung hinzufügen',
						default: {},
						options: [
							{
								displayName: 'Sortier-Regel',
								name: 'sort',
								values: [
									{
										displayName: 'Spalten-ID',
										name: 'columnId',
										type: 'string',
										required: true,
										default: '',
										description: 'Die ID der zu sortierenden Spalte',
										placeholder: '1',
									},
									{
										displayName: 'Richtung',
										name: 'direction',
										type: 'string',
										default: 'ASC',
										description: 'Die Sortierrichtung. Gültige Werte: "ASC" (aufsteigend A-Z, 1-9), "DESC" (absteigend Z-A, 9-1)',
										placeholder: 'ASC',
									},
								],
							},
						],
						description: 'Die Sortier-Regeln für die View',
					},
				],
			},
		],
		description: 'Sortierungs-Konfiguration für die View',
	},

	// ==============================================
	// ORIGINAL OPERATIONS - Für normale UI Nutzer
	// ==============================================

	// Tabellen-ID für getAll, create
	{
		displayName: 'Tabelle',
		name: 'tableId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Wählen Sie eine Tabelle aus der Liste oder geben Sie deren ID an',
		modes: [
			{
				displayName: 'Liste',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getTables',
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				placeholder: 'Tabellen-ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[0-9]+$',
							errorMessage: 'Bitte eine gültige Tabellen-ID (Zahl) eingeben',
						},
					},
				],
			},
		],
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['getAll', 'create'],
			},
		},
	},

	// View-ID als resourceLocator für get, update, delete
	{
		displayName: 'View',
		name: 'viewId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Wählen Sie eine View aus der Liste oder geben Sie deren ID an',
		modes: [
			{
				displayName: 'Liste',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getViews',
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				placeholder: 'View-ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[0-9]+$',
							errorMessage: 'Bitte eine gültige View-ID (Zahl) eingeben',
						},
					},
				],
			},
		],
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['get', 'update', 'delete'],
			},
		},
	},

	// Titel für create
	{
		displayName: 'Titel',
		name: 'title',
		type: 'string',
		required: true,
		typeOptions: {
			canBeExpression: true,
		},
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Der Titel der neuen View',
		placeholder: 'View-Name eingeben...',
	},

	// Emoji für create
	{
		displayName: 'Emoji',
		name: 'emoji',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Ein optionales Emoji für die View',
		placeholder: '🔍',
	},

	// Beschreibung für create
	{
		displayName: 'Beschreibung',
		name: 'description',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Eine optionale Beschreibung für die View',
		placeholder: 'Beschreibung der View...',
	},

	// Zusätzliche Felder für update
	{
		displayName: 'Titel',
		name: 'title',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Der neue Titel der View (optional)',
		placeholder: 'Neuer View-Name...',
	},

	{
		displayName: 'Emoji',
		name: 'emoji',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Das neue Emoji für die View (optional)',
		placeholder: '🔍',
	},

	{
		displayName: 'Beschreibung',
		name: 'description',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
			rows: 3,
		},
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Die neue Beschreibung der View (optional)',
		placeholder: 'Neue Beschreibung...',
	},

	// Filter für create/update
	{
		displayName: 'Filter',
		name: 'filter',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Filter hinzufügen',
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Filter-Regel',
				name: 'rule',
				values: [
					{
						displayName: 'Spalte',
						name: 'columnId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getColumns',
						},
						default: '',
						description: 'Die Spalte für den Filter',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'string',
						default: 'EQ',
						description: 'Der Vergleichsoperator',
						placeholder: 'EQ',
					},
					{
						displayName: 'Wert',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Der Wert für den Vergleich',
						typeOptions: {
							canBeExpression: true,
						},
					},
				],
			},
		],
		description: 'Filter-Regeln für die View',
	},

	// Sortierung für create/update
	{
		displayName: 'Sortierung',
		name: 'sort',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Sortierung hinzufügen',
		displayOptions: {
			show: {
				resource: ['view'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Sortier-Regel',
				name: 'rule',
				values: [
					{
						displayName: 'Spalte',
						name: 'columnId',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getColumns',
						},
						default: '',
						description: 'Die Spalte für die Sortierung',
					},
					{
						displayName: 'Richtung',
						name: 'mode',
						type: 'options',
						options: [
							{
								name: 'Aufsteigend',
								value: 'ASC',
								description: 'Von klein zu groß (A-Z, 1-9)',
							},
							{
								name: 'Absteigend',
								value: 'DESC',
								description: 'Von groß zu klein (Z-A, 9-1)',
							},
						],
						default: 'ASC',
						description: 'Die Sortierrichtung',
					},
				],
			},
		],
		description: 'Sortier-Regeln für die View',
	},
];
