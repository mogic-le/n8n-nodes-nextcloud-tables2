import { INodeProperties } from 'n8n-workflow';

export const columnOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['column'],
			},
		},
		options: [
			{
				name: 'Alle Spalten Abrufen',
				value: 'getAll',
				description: 'Alle Spalten einer Tabelle abrufen',
				action: 'Alle Spalten abrufen',
			},
			{
				name: 'Spalte Abrufen',
				value: 'get',
				description: 'Eine spezifische Spalte abrufen',
				action: 'Spalte abrufen',
			},
			{
				name: 'Spalte Erstellen',
				value: 'create',
				description: 'Eine neue Spalte erstellen',
				action: 'Spalte erstellen',
			},
			{
				name: 'Spalte Erstellen (KI-Friendly)',
				value: 'createAIFriendly',
				description: 'Eine neue Spalte erstellen - optimiert für KI Agents',
				action: 'Spalte erstellen (KI-Friendly)',
			},
			{
				name: 'Spalte Aktualisieren',
				value: 'update',
				description: 'Eine Spalte aktualisieren',
				action: 'Spalte aktualisieren',
			},
			{
				name: 'Spalte Aktualisieren (KI-Friendly)',
				value: 'updateAIFriendly',
				description: 'Eine Spalte komplett aktualisieren - optimiert für KI Agents',
				action: 'Spalte aktualisieren (KI-Friendly)',
			},
			{
				name: 'Spalte Löschen',
				value: 'delete',
				description: 'Eine Spalte löschen',
				action: 'Spalte löschen',
			},
		],
		default: 'getAll',
	},
];

export const columnFields: INodeProperties[] = [
	// ==============================================
	// KI-FRIENDLY OPERATIONS - ALLE Parameter verfügbar
	// ==============================================

	// Tabellen-ID (String-Eingabe für KI Agents - nur für CREATE)
	{
		displayName: 'tableIdAI',
		name: 'tableIdAI',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly'],
			},
		},
		default: '',
		description: 'Die ID der Tabelle in der die Spalte erstellt werden soll (nur für createAIFriendly Operation verwendet, wird bei anderen ignoriert)',
		placeholder: '123',
	},

	// Basis-Parameter (immer verfügbar)
	{
		displayName: 'columnType',
		name: 'columnType',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: 'text',
		description: 'Der Typ der Spalte (erforderlich für createAIFriendly, optional für updateAIFriendly, wird bei anderen ignoriert). Gültige Werte: "text", "number", "datetime", "selection", "usergroup"',
		placeholder: 'text',
	},

	{
		displayName: 'columnTitle',
		name: 'columnTitle',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Der Titel der Spalte (erforderlich für createAIFriendly, optional für updateAIFriendly, wird bei anderen ignoriert)',
		placeholder: 'Meine Spalte',
	},

	{
		displayName: 'columnDescription',
		name: 'columnDescription',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Optionale Beschreibung für die Spalte (für createAIFriendly/updateAIFriendly Operationen verwendet, wird bei anderen ignoriert)',
		placeholder: 'Beschreibung der Spalte...',
	},

	{
		displayName: 'columnMandatory',
		name: 'columnMandatory',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: false,
		description: 'Ob diese Spalte ein Pflichtfeld ist (für createAIFriendly/updateAIFriendly Operationen verwendet, wird bei anderen ignoriert)',
	},

	// TEXT-parameter (immer verfügbar - nur relevant wenn columnType="text")
	{
		displayName: 'textSubtypeAI',
		name: 'textSubtypeAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: 'line',
		description: 'Subtyp für Text-Spalten (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet). Gültige Werte: "line" (einzeilig), "long" (mehrzeilig)',
		placeholder: 'line',
	},

	{
		displayName: 'textDefaultAI',
		name: 'textDefaultAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Standard-Wert für neue Zeilen (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
		placeholder: 'Standard-Text...',
	},

	{
		displayName: 'textMaxLengthAI',
		name: 'textMaxLengthAI',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: 255,
		description: 'Maximale Zeichen-Anzahl (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
	},

	{
		displayName: 'textPatternAI',
		name: 'textPatternAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Regex-Pattern zur Validierung (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
		placeholder: '^[A-Za-z0-9]+$',
	},

	// NUMBER-parameter (immer verfügbar - nur relevant wenn columnType="number")
	{
		displayName: 'numberDefaultAI',
		name: 'numberDefaultAI',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: 0,
		description: 'Standard-Wert für neue Zeilen (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
	},

	{
		displayName: 'numberMinAI',
		name: 'numberMinAI',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Kleinster erlaubter Wert (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
	},

	{
		displayName: 'numberMaxAI',
		name: 'numberMaxAI',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Größter erlaubter Wert (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
	},

	{
		displayName: 'numberDecimalsAI',
		name: 'numberDecimalsAI',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: 0,
		description: 'Anzahl der Dezimalstellen (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
	},

	{
		displayName: 'numberPrefixAI',
		name: 'numberPrefixAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Text vor der Zahl, z.B. "€" (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
		placeholder: '€',
	},

	{
		displayName: 'numberSuffixAI',
		name: 'numberSuffixAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Text nach der Zahl, z.B. "kg" (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
		placeholder: 'kg',
	},

	// DATETIME-parameter (immer verfügbar - nur relevant wenn columnType="datetime")
	{
		displayName: 'datetimeDefaultAI',
		name: 'datetimeDefaultAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Standard-Datum/Zeit in ISO 8601 Format oder "today" (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
		placeholder: '2024-01-01T12:00:00Z oder "today"',
	},

	// SELECTION-parameter (immer verfügbar - nur relevant wenn columnType="selection")
	{
		displayName: 'selectionOptionsAI',
		name: 'selectionOptionsAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'JSON-Array mit Auswahl-Optionen, z.B. ["Option 1", "Option 2"] (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
		placeholder: '["Option 1", "Option 2", "Option 3"]',
	},

	{
		displayName: 'selectionDefaultAI',
		name: 'selectionDefaultAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Standard-Auswahl (muss in den Optionen enthalten sein, wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
		placeholder: 'Option 1',
	},

	{
		displayName: 'selectionMultipleAI',
		name: 'selectionMultipleAI',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: false,
		description: 'Ob mehrere Optionen gleichzeitig ausgewählt werden können (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
	},

	// USERGROUP-parameter (immer verfügbar - nur relevant wenn columnType="usergroup")
	{
		displayName: 'usergroupTypeAI',
		name: 'usergroupTypeAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: 'user',
		description: 'Art der Benutzer/Gruppen-Auswahl (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet). Gültige Werte: "user" (Benutzer), "group" (Gruppen)',
		placeholder: 'user',
	},

	{
		displayName: 'usergroupDefaultAI',
		name: 'usergroupDefaultAI',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: '',
		description: 'Standard-Benutzer/Gruppe (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
		placeholder: 'admin',
	},

	{
		displayName: 'usergroupMultipleAI',
		name: 'usergroupMultipleAI',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['createAIFriendly', 'updateAIFriendly'],
			},
		},
		default: false,
		description: 'Ob mehrere Benutzer/Gruppen gleichzeitig ausgewählt werden können (wird ignoriert bei anderen Typen, für createAIFriendly/updateAIFriendly Operationen verwendet)',
	},

	// SPALTEN-ID für updateAIFriendly (String-Eingabe für KI Agents)
	{
		displayName: 'columnIdAI',
		name: 'columnIdAI',
		type: 'string',
		required: false,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['updateAIFriendly'],
			},
		},
		default: '',
		description: 'Die ID der Spalte die aktualisiert werden soll (nur für updateAIFriendly Operation verwendet, wird bei anderen ignoriert)',
		placeholder: '456',
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
				resource: ['column'],
				operation: ['getAll', 'create'],
			},
		},
	},

	// Spalten-ID als resourceLocator für get, update, delete
	{
		displayName: 'Spalte',
		name: 'columnId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'Wählen Sie eine Spalte aus der Liste oder geben Sie deren ID an',
		modes: [
			{
				displayName: 'Liste',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'getColumns',
					searchable: true,
					searchFilterRequired: false,
				},
			},
			{
				displayName: 'ID',
				name: 'id',
				type: 'string',
				placeholder: 'Spalten-ID',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '^[0-9]+$',
							errorMessage: 'Bitte eine gültige Spalten-ID (Zahl) eingeben',
						},
					},
				],
			},
		],
		displayOptions: {
			show: {
				resource: ['column'],
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
				resource: ['column'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Der Titel der neuen Spalte',
		placeholder: 'Spalten-Name eingeben...',
	},

	// Beschreibung für create
	{
		displayName: 'Beschreibung',
		name: 'description',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Eine optionale Beschreibung für die Spalte',
		placeholder: 'Beschreibung der Spalte...',
	},

	// Typ für create
	{
		displayName: 'Spalten-Typ',
		name: 'type',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Text',
				value: 'text',
				description: 'Textspalte',
			},
			{
				name: 'Zahl',
				value: 'number',
				description: 'Zahlenspalte',
			},
			{
				name: 'Datum/Zeit',
				value: 'datetime',
				description: 'Datum- und Zeitspalte',
			},
			{
				name: 'Auswahl',
				value: 'selection',
				description: 'Auswahlliste',
			},
			{
				name: 'Benutzer/Gruppe',
				value: 'usergroup',
				description: 'Benutzer- oder Gruppenauswahl',
			},
		],
		default: 'text',
		description: 'Der Typ der Spalte',
	},

	// Mandatory für create
	{
		displayName: 'Pflichtfeld',
		name: 'mandatory',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
			},
		},
		default: false,
		description: 'Ob diese Spalte ein Pflichtfeld ist',
	},

	// Text-spezifische Konfiguration für create
	{
		displayName: 'Text-Subtyp',
		name: 'textSubtype',
		type: 'options',
		options: [
			{
				name: 'Line (Einzeilig)',
				value: 'line',
				description: 'Einzeiliges Textfeld',
			},
			{
				name: 'Long Text (Mehrzeilig)',
				value: 'long',
				description: 'Mehrzeiliges Textfeld',
			},
		],
		default: 'line',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['text'],
			},
		},
		description: 'Der Subtyp der Text-Spalte',
	},

	{
		displayName: 'Standard-Text',
		name: 'textDefault',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['text'],
			},
		},
		description: 'Standard-Wert für neue Zeilen',
		placeholder: 'Standard-Text...',
	},

	{
		displayName: 'Maximale Länge',
		name: 'textMaxLength',
		type: 'number',
		default: 255,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['text'],
			},
		},
		description: 'Maximale Anzahl Zeichen (leer = unbegrenzt)',
	},

	{
		displayName: 'Validierungs-Pattern',
		name: 'textAllowedPattern',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['text'],
			},
		},
		description: 'Regex-Pattern zur Validierung (optional)',
		placeholder: '^[A-Za-z0-9]+$',
	},

	// Number-spezifische Konfiguration für create
	{
		displayName: 'Standard-Zahl',
		name: 'numberDefault',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['number'],
			},
		},
		description: 'Standard-Wert für neue Zeilen',
	},

	{
		displayName: 'Minimum',
		name: 'numberMin',
		type: 'number',
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['number'],
			},
		},
		description: 'Kleinster erlaubter Wert (optional)',
	},

	{
		displayName: 'Maximum',
		name: 'numberMax',
		type: 'number',
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['number'],
			},
		},
		description: 'Größter erlaubter Wert (optional)',
	},

	{
		displayName: 'Dezimalstellen',
		name: 'numberDecimals',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['number'],
			},
		},
		description: 'Anzahl der Dezimalstellen',
	},

	{
		displayName: 'Präfix',
		name: 'numberPrefix',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['number'],
			},
		},
		description: 'Text vor der Zahl (z.B. "€")',
		placeholder: '€',
	},

	{
		displayName: 'Suffix',
		name: 'numberSuffix',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['number'],
			},
		},
		description: 'Text nach der Zahl (z.B. "kg")',
		placeholder: 'kg',
	},

	// Datetime-spezifische Konfiguration für create
	{
		displayName: 'Standard-Datum',
		name: 'datetimeDefault',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['datetime'],
			},
		},
		description: 'Standard-Datum/Zeit (ISO 8601 Format oder "today")',
		placeholder: '2024-01-01T12:00:00Z oder "today"',
	},

	// Selection-spezifische Konfiguration für create
	{
		displayName: 'Auswahl-Optionen',
		name: 'selectionOptions',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Option hinzufügen',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['selection'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Option',
				name: 'option',
				values: [
					{
						displayName: 'Wert',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Der Wert der Option',
						placeholder: 'Option eingeben...',
					},
				],
			},
		],
		description: 'Die verfügbaren Auswahl-Optionen',
	},

	{
		displayName: 'Standard-Auswahl',
		name: 'selectionDefault',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['selection'],
			},
		},
		description: 'Standard-Auswahl (muss in den Optionen enthalten sein)',
		placeholder: 'Option 1',
	},

	{
		displayName: 'Mehrfach-Auswahl',
		name: 'selectionMultiple',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['selection'],
			},
		},
		description: 'Ob mehrere Optionen gleichzeitig ausgewählt werden können',
	},

	// UserGroup-spezifische Konfiguration für create
	{
		displayName: 'Benutzer/Gruppen-Typ',
		name: 'usergroupType',
		type: 'options',
		options: [
			{
				name: 'User (Benutzer)',
				value: 'user',
				description: 'Nur Benutzer auswählbar',
			},
			{
				name: 'Group (Gruppen)',
				value: 'group',
				description: 'Nur Gruppen auswählbar',
			},
		],
		default: 'user',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['usergroup'],
			},
		},
		description: 'Art der Benutzer/Gruppen-Auswahl',
	},

	{
		displayName: 'Standard-Benutzer/Gruppe',
		name: 'usergroupDefault',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['usergroup'],
			},
		},
		description: 'Standard-Benutzer/Gruppe',
		placeholder: 'admin',
	},

	{
		displayName: 'Mehrfach-Auswahl',
		name: 'usergroupMultiple',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['create'],
				type: ['usergroup'],
			},
		},
		description: 'Ob mehrere Benutzer/Gruppen gleichzeitig ausgewählt werden können',
	},

	// Felder für update
	{
		displayName: 'Titel',
		name: 'title',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Der neue Titel der Spalte (optional)',
		placeholder: 'Neuer Spalten-Name...',
	},

	{
		displayName: 'Beschreibung',
		name: 'description',
		type: 'string',
		typeOptions: {
			canBeExpression: true,
		},
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['update'],
			},
		},
		default: '',
		description: 'Die neue Beschreibung der Spalte (optional)',
		placeholder: 'Neue Beschreibung...',
	},

	{
		displayName: 'Pflichtfeld',
		name: 'mandatory',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['column'],
				operation: ['update'],
			},
		},
		default: false,
		description: 'Ob diese Spalte ein Pflichtfeld ist',
	},
];
