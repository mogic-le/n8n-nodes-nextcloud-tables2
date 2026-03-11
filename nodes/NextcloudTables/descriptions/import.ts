import { INodeProperties } from 'n8n-workflow';

export const importOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['import'],
			},
		},
		options: [
			{
				name: 'CSV-Import',
				value: 'importCsv',
				description: 'Eine CSV-Datei in eine Tabelle importieren',
				action: 'CSV-Datei importieren',
			},
			{
				name: 'Import-Status Prüfen',
				value: 'getImportStatus',
				description: 'Den Status eines laufenden Imports prüfen',
				action: 'Import-Status prüfen',
			},
		],
		default: 'importCsv',
	},
];

export const importFields: INodeProperties[] = [
	// Tabellen-ID für Import
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
				resource: ['import'],
				operation: ['importCsv'],
			},
		},
	},

	// CSV-Datei
	{
		displayName: 'CSV-Datei',
		name: 'csvFile',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['import'],
				operation: ['importCsv'],
			},
		},
		default: '',
		description: 'Die CSV-Datei zum Importieren (Dateiinhalt oder Dateipfad)',
		placeholder: 'CSV-Dateiinhalt oder Pfad zur Datei...',
		typeOptions: {
			alwaysOpenEditWindow: true,
		},
	},

	// Import-Optionen
	{
		displayName: 'Import-Optionen',
		name: 'importOptions',
		type: 'collection',
		placeholder: 'Option hinzufügen',
		displayOptions: {
			show: {
				resource: ['import'],
				operation: ['importCsv'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Erste Zeile enthält Spaltenüberschriften',
				name: 'hasHeader',
				type: 'boolean',
				default: true,
				description: 'Ob die erste Zeile der CSV-Datei Spaltenüberschriften enthält',
			},
			{
				displayName: 'Trennzeichen',
				name: 'delimiter',
				type: 'options',
				default: ',',
				description: 'Das Trennzeichen für CSV-Spalten',
				options: [
					{
						name: 'Komma (,)',
						value: ',',
					},
					{
						name: 'Semikolon (;)',
						value: ';',
					},
					{
						name: 'Tab',
						value: '\t',
					},
					{
						name: 'Pipe (|)',
						value: '|',
					},
					{
						name: 'Benutzerdefiniert',
						value: 'custom',
					},
				],
			},
			{
				displayName: 'Benutzerdefiniertes Trennzeichen',
				name: 'customDelimiter',
				type: 'string',
				default: '',
				description: 'Benutzerdefiniertes Trennzeichen (nur relevant wenn Trennzeichen auf "Benutzerdefiniert" gesetzt ist)',
				placeholder: 'z.B. | oder ;',
			},
			{
				displayName: 'Textqualifizierer',
				name: 'textQualifier',
				type: 'options',
				default: '"',
				description: 'Zeichen zum Umschließen von Textwerten',
				options: [
					{
						name: 'Anführungszeichen (")',
						value: '"',
					},
					{
						name: 'Apostroph (\')',
						value: "'",
					},
					{
						name: 'Keine',
						value: '',
					},
				],
			},
			{
				displayName: 'Leere Zeilen überspringen',
				name: 'skipEmptyRows',
				type: 'boolean',
				default: true,
				description: 'Ob leere Zeilen beim Import übersprungen werden sollen',
			},
			{
				displayName: 'Fehlerhafte Zeilen überspringen',
				name: 'skipInvalidRows',
				type: 'boolean',
				default: false,
				description: 'Ob Zeilen mit Fehlern übersprungen werden sollen (anstatt den Import abzubrechen)',
			},
		],
	},

	// Spalten-Mapping
	{
		displayName: 'Spalten-Mapping',
		name: 'columnMapping',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['import'],
				operation: ['importCsv'],
			},
		},
		default: {},
		placeholder: 'Spalten-Zuordnung hinzufügen',
		options: [
			{
				displayName: 'Spalten-Zuordnung',
				name: 'mapping',
				values: [
					{
						displayName: 'CSV-Spalte',
						name: 'csvColumn',
						type: 'string',
						default: '',
						description: 'Name oder Index der CSV-Spalte (bei Index: 0, 1, 2, ...)',
						placeholder: 'z.B. "Name" oder "0"',
					},
					{
						displayName: 'Tabellen-Spalte',
						name: 'tableColumn',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getColumns',
						},
						default: '',
						description: 'Zielspalte in der Nextcloud-Tabelle',
					},
					{
						displayName: 'Datentyp-Konvertierung',
						name: 'dataType',
						type: 'options',
						default: 'auto',
						description: 'Wie die Daten konvertiert werden sollen',
						options: [
							{
								name: 'Automatisch',
								value: 'auto',
								description: 'Automatische Erkennung basierend auf Spaltentyp',
							},
							{
								name: 'Text',
								value: 'text',
								description: 'Als Text behandeln',
							},
							{
								name: 'Zahl',
								value: 'number',
								description: 'Als Zahl behandeln',
							},
							{
								name: 'Datum',
								value: 'datetime',
								description: 'Als Datum/Zeit behandeln',
							},
							{
								name: 'Boolean',
								value: 'boolean',
								description: 'Als Wahr/Falsch behandeln',
							},
						],
					},
				],
			},
		],
		description: 'Zuordnung zwischen CSV-Spalten und Tabellen-Spalten (optional - ohne Mapping werden Spalten automatisch zugeordnet)',
	},

	// Import-ID für Status-Abfrage
	{
		displayName: 'Import-ID',
		name: 'importId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['import'],
				operation: ['getImportStatus'],
			},
		},
		default: '',
		description: 'Die ID des zu prüfenden Imports',
		placeholder: 'Import-ID eingeben...',
	},
];
