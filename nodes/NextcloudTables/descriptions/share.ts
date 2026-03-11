import { INodeProperties } from 'n8n-workflow';

export const shareOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['share'],
			},
		},
		options: [
			{
				name: 'Alle Shares Abrufen',
				value: 'getAll',
				description: 'Alle Shares einer Tabelle abrufen',
				action: 'Alle Shares abrufen',
			},
			{
				name: 'Share Erstellen',
				value: 'create',
				description: 'Einen neuen Share erstellen',
				action: 'Share erstellen',
			},
			{
				name: 'Share Aktualisieren',
				value: 'update',
				description: 'Berechtigungen eines Shares aktualisieren',
				action: 'Share aktualisieren',
			},
			{
				name: 'Share Löschen',
				value: 'delete',
				description: 'Einen Share löschen',
				action: 'Share löschen',
			},
		],
		default: 'getAll',
	},
];

export const shareFields: INodeProperties[] = [
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
			},
		],
		displayOptions: {
			show: {
				resource: ['share'],
				operation: ['getAll', 'create'],
			},
		},
	},

	// Share-ID für update, delete
	{
		displayName: 'Share-ID',
		name: 'shareId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['share'],
				operation: ['update', 'delete'],
			},
		},
		default: '',
		description: 'Die ID des Shares (Zahl)',
		placeholder: 'Share-ID eingeben...',
	},

	// Share-Typ für create
	{
		displayName: 'Share-Typ',
		name: 'shareType',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['share'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Benutzer',
				value: 'user',
				description: 'Mit einem spezifischen Benutzer teilen',
			},
			{
				name: 'Gruppe',
				value: 'group',
				description: 'Mit einer Benutzergruppe teilen',
			},
		],
		default: 'user',
		description: 'Der Typ des Shares',
	},

	// Empfänger für create - Benutzer
	{
		displayName: 'Benutzer',
		name: 'userReceiver',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		displayOptions: {
			show: {
				resource: ['share'],
				operation: ['create'],
				shareType: ['user'],
			},
		},
		default: '',
		description: 'Wählen Sie den Benutzer für den Share aus',
		hint: 'Alle verfügbaren Nextcloud-Benutzer in Ihrer Instanz',
	},

	// Empfänger für create - Gruppe
	{
		displayName: 'Gruppe',
		name: 'groupReceiver',
		type: 'options',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getGroups',
		},
		displayOptions: {
			show: {
				resource: ['share'],
				operation: ['create'],
				shareType: ['group'],
			},
		},
		default: '',
		description: 'Wählen Sie die Gruppe für den Share aus',
		hint: 'Alle verfügbaren Nextcloud-Gruppen in Ihrer Instanz',
	},

	// Berechtigungen für create und update
	{
		displayName: 'Berechtigungen',
		name: 'permissions',
		type: 'fixedCollection',
		required: true,
		displayOptions: {
			show: {
				resource: ['share'],
				operation: ['create', 'update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Berechtigungen',
				name: 'permission',
				values: [
					{
						displayName: 'Lesen',
						name: 'read',
						type: 'boolean',
						default: true,
						description: 'Berechtigung zum Lesen der Tabellendaten',
					},
					{
						displayName: 'Erstellen',
						name: 'create',
						type: 'boolean',
						default: false,
						description: 'Berechtigung zum Erstellen neuer Zeilen',
					},
					{
						displayName: 'Aktualisieren',
						name: 'update',
						type: 'boolean',
						default: false,
						description: 'Berechtigung zum Bearbeiten bestehender Zeilen',
					},
					{
						displayName: 'Löschen',
						name: 'delete',
						type: 'boolean',
						default: false,
						description: 'Berechtigung zum Löschen von Zeilen',
					},
					{
						displayName: 'Verwalten',
						name: 'manage',
						type: 'boolean',
						default: false,
						description: 'Vollzugriff: Struktur ändern, Shares verwalten, etc.',
					},
				],
			},
		],
		description: 'Die Berechtigungen für diesen Share',
	},

	// Zusätzliche Optionen für create
	{
		displayName: 'Zusätzliche Optionen',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Option hinzufügen',
		displayOptions: {
			show: {
				resource: ['share'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Anzeigename',
				name: 'displayName',
				type: 'string',
				default: '',
				description: 'Optionaler Anzeigename für den Share',
				placeholder: 'Anzeigename eingeben...',
			},
		],
	},
];
