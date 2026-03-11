import { IExecuteFunctions } from 'n8n-workflow';
import { ApiHelper } from '../helpers/api.helper';
import { Row, Column } from '../interfaces';
import { DataFormatter, FormatOptions } from '../helpers/data.formatter';

export class RowHandler {
	static async execute(context: IExecuteFunctions, operation: string, itemIndex: number): Promise<any> {
		switch (operation) {
			case 'getAll':
				return this.getAll(context, itemIndex);
			case 'get':
				return this.get(context, itemIndex);
			case 'create':
				return this.create(context, itemIndex);
			case 'createAIFriendly':
				return this.createAIFriendly(context, itemIndex);
			case 'getAllAIFriendly':
				return this.getAllAIFriendly(context, itemIndex);
			case 'update':
				return this.update(context, itemIndex);
			case 'updateAIFriendly':
				return this.updateAIFriendly(context, itemIndex);
			default:
				throw new Error(`Unbekannte Operation: ${operation}`);
		}
	}

	/**
	 * Alle Zeilen abrufen
	 */
	private static async getAll(context: IExecuteFunctions, itemIndex: number): Promise<Row[]> {
		const nodeCollection = context.getNodeParameter('nodeCollection', itemIndex) as string;
		const additionalOptions = context.getNodeParameter('additionalOptions', itemIndex, {}) as any;
		const limit = additionalOptions.limit || 50;
		const offset = additionalOptions.offset || 0;

		let endpoint: string;
		let tableId: number;

		if (nodeCollection === 'tables') {
			tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));
			endpoint = `/tables/${tableId}/rows`;
		} else {
			const viewId = ApiHelper.getResourceId(context.getNodeParameter('viewId', itemIndex));
			endpoint = `/views/${viewId}/rows`;

			// Für Views müssen wir die Tabellen-ID ermitteln für Spalten-Info
			try {
				const view = await ApiHelper.makeApiRequest<any>(context, 'GET', `/views/${viewId}`);
				tableId = view.tableId;
			} catch (error) {
				// Fallback ohne Spalten-Info
				tableId = 0;
			}
		}

		// Basis Query-Parameter
		const queryParams: Record<string, string> = {
			limit: limit.toString(),
			offset: offset.toString(),
		};

		// Erweiterte Filter, Sortierung und Suche
		if (additionalOptions.useFilters) {
			const filters = context.getNodeParameter('filters.filter', itemIndex, []) as any[];
			this.applyFilters(queryParams, filters);
		}

		if (additionalOptions.useSorting) {
			const sorting = context.getNodeParameter('sorting.sort', itemIndex, []) as any[];
			this.applySorting(queryParams, sorting);
		}

		if (additionalOptions.useSearch) {
			const search = context.getNodeParameter('search', itemIndex, {}) as any;
			this.applySearch(queryParams, search);
		}

		try {
			const rows = await ApiHelper.makeApiRequest<Row[]>(
				context,
				'GET',
				endpoint,
				queryParams,
			);

			// Optional: Spalten-Info laden für bessere Datenformatierung bei der Ausgabe
			let columns: Column[] = [];
			if (tableId > 0) {
				columns = await ApiHelper.getTableColumns(context, tableId);
			}

			// Client-seitige Nachbearbeitung falls erforderlich
			let processedRows = rows;

			// Client-seitige Filterung falls Server-API nicht alle Filter unterstützt
			if (additionalOptions.useFilters) {
				const filters = context.getNodeParameter('filters.filter', itemIndex, []) as any[];
				processedRows = this.applyClientSideFilters(processedRows, filters, columns);
			}

			// Client-seitige Suche falls Server-API nicht alle Suchoptionen unterstützt
			if (additionalOptions.useSearch) {
				const search = context.getNodeParameter('search', itemIndex, {}) as any;
				processedRows = this.applyClientSideSearch(processedRows, search, columns);
			}

			// Zeilen für bessere Lesbarkeit formatieren
			return this.formatRowsForOutput(processedRows, columns);
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}

	/**
	 * Wendet Filter auf Query-Parameter an
	 */
	private static applyFilters(queryParams: Record<string, string>, filters: any[]): void {
		if (!filters || filters.length === 0) {
			return;
		}

		// Nextcloud Tables API Filter-Format (falls unterstützt)
		const filterQueries: string[] = [];

		for (const filter of filters) {
			if (filter.columnId && filter.operator) {
				let filterQuery = '';

				switch (filter.operator) {
					case 'equals':
						filterQuery = `${filter.columnId}=${encodeURIComponent(filter.value || '')}`;
						break;
					case 'not_equals':
						filterQuery = `${filter.columnId}!=${encodeURIComponent(filter.value || '')}`;
						break;
					case 'greater_than':
						filterQuery = `${filter.columnId}>${encodeURIComponent(filter.value || '')}`;
						break;
					case 'greater_equal':
						filterQuery = `${filter.columnId}>=${encodeURIComponent(filter.value || '')}`;
						break;
					case 'less_than':
						filterQuery = `${filter.columnId}<${encodeURIComponent(filter.value || '')}`;
						break;
					case 'less_equal':
						filterQuery = `${filter.columnId}<=${encodeURIComponent(filter.value || '')}`;
						break;
					case 'contains':
						filterQuery = `${filter.columnId}~${encodeURIComponent(filter.value || '')}`;
						break;
					case 'is_empty':
						filterQuery = `${filter.columnId}=null`;
						break;
					case 'is_not_empty':
						filterQuery = `${filter.columnId}!=null`;
						break;
				}

				if (filterQuery) {
					filterQueries.push(filterQuery);
				}
			}
		}

		if (filterQueries.length > 0) {
			queryParams['filter'] = filterQueries.join('&');
		}
	}

	/**
	 * Wendet Sortierung auf Query-Parameter an
	 */
	private static applySorting(queryParams: Record<string, string>, sorting: any[]): void {
		if (!sorting || sorting.length === 0) {
			return;
		}

		const sortQueries: string[] = [];

		for (const sort of sorting) {
			if (sort.columnId && sort.direction) {
				const direction = sort.direction === 'DESC' ? '-' : '';
				sortQueries.push(`${direction}${sort.columnId}`);
			}
		}

		if (sortQueries.length > 0) {
			queryParams['sort'] = sortQueries.join(',');
		}
	}

	/**
	 * Wendet Suche auf Query-Parameter an
	 */
	private static applySearch(queryParams: Record<string, string>, search: any): void {
		if (!search || !search.term) {
			return;
		}

		queryParams['search'] = encodeURIComponent(search.term);

		if (search.searchColumns && search.searchColumns.length > 0) {
			queryParams['searchColumns'] = search.searchColumns.join(',');
		}

		if (search.caseSensitive) {
			queryParams['caseSensitive'] = 'true';
		}
	}

	/**
	 * Client-seitige Filterung für erweiterte Filter-Optionen
	 */
	private static applyClientSideFilters(rows: Row[], filters: any[], columns: Column[]): Row[] {
		if (!filters || filters.length === 0) {
			return rows;
		}

		return rows.filter(row => {
			return filters.every(filter => {
				if (!filter.columnId || !filter.operator) {
					return true;
				}

				const columnId = parseInt(filter.columnId, 10);
				const rowData = row.data?.find(d => d.columnId === columnId);
				const value = rowData?.value;
				const filterValue = filter.value;

				return this.evaluateFilter(value, filter.operator, filterValue);
			});
		});
	}

	/**
	 * Client-seitige Suche für erweiterte Suchoptionen
	 */
	private static applyClientSideSearch(rows: Row[], search: any, columns: Column[]): Row[] {
		if (!search || !search.term) {
			return rows;
		}

		const searchTerm = search.caseSensitive ? search.term : search.term.toLowerCase();
		const searchColumns = search.searchColumns || [];

		return rows.filter(row => {
			if (!row.data) {
				return false;
			}

			// Bestimme welche Spalten durchsucht werden sollen
			let columnsToSearch = columns;
			if (searchColumns.length > 0) {
				columnsToSearch = columns.filter(col => searchColumns.includes(col.id.toString()));
			}

			// Durchsuche nur Text-Spalten
			const textColumns = columnsToSearch.filter(col => col.type === 'text');

			return textColumns.some(column => {
				const rowData = row.data!.find(d => d.columnId === column.id);
				if (!rowData || !rowData.value) {
					return false;
				}

				const cellValue = search.caseSensitive
					? String(rowData.value)
					: String(rowData.value).toLowerCase();

				return cellValue.includes(searchTerm);
			});
		});
	}

	/**
	 * Evaluiert eine Filter-Bedingung
	 */
	private static evaluateFilter(value: any, operator: string, filterValue: any): boolean {
		switch (operator) {
			case 'equals':
				return value == filterValue;
			case 'not_equals':
				return value != filterValue;
			case 'greater_than':
				return this.compareValues(value, filterValue) > 0;
			case 'greater_equal':
				return this.compareValues(value, filterValue) >= 0;
			case 'less_than':
				return this.compareValues(value, filterValue) < 0;
			case 'less_equal':
				return this.compareValues(value, filterValue) <= 0;
			case 'contains':
				return String(value || '').toLowerCase().includes(String(filterValue || '').toLowerCase());
			case 'starts_with':
				return String(value || '').toLowerCase().startsWith(String(filterValue || '').toLowerCase());
			case 'ends_with':
				return String(value || '').toLowerCase().endsWith(String(filterValue || '').toLowerCase());
			case 'is_empty':
				return value === null || value === undefined || value === '';
			case 'is_not_empty':
				return value !== null && value !== undefined && value !== '';
			default:
				return true;
		}
	}

	/**
	 * Vergleicht zwei Werte für numerische/alphanumerische Sortierung
	 */
	private static compareValues(a: any, b: any): number {
		// Numerischer Vergleich falls beide Zahlen sind
		const numA = parseFloat(a);
		const numB = parseFloat(b);

		if (!isNaN(numA) && !isNaN(numB)) {
			return numA - numB;
		}

		// Datum-Vergleich falls beide Daten sind
		const dateA = new Date(a);
		const dateB = new Date(b);

		if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
			return dateA.getTime() - dateB.getTime();
		}

		// String-Vergleich
		return String(a || '').localeCompare(String(b || ''));
	}

	/**
	 * Eine einzelne Zeile abrufen (über clientseitige Filterung)
	 * Da die Nextcloud Tables API keinen direkten Einzelzeilen-Abruf unterstützt,
	 * werden alle Zeilen abgerufen und dann gefiltert.
	 */
	private static async get(context: IExecuteFunctions, itemIndex: number): Promise<Row> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));
		const rowId = ApiHelper.validateRowId(context.getNodeParameter('rowId', itemIndex));

		try {
			// Alle Zeilen der Tabelle abrufen
			const allRows = await ApiHelper.makeApiRequest<Row[]>(
				context,
				'GET',
				`/tables/${tableId}/rows`,
			);

			// Die gewünschte Zeile finden
			const targetRow = allRows.find(row => row.id === rowId);

			if (!targetRow) {
				throw new Error(`Zeile mit ID ${rowId} wurde in Tabelle ${tableId} nicht gefunden`);
			}

			// Spalten-Info für bessere Formatierung laden
			const columns = await ApiHelper.getTableColumns(context, tableId);

			return this.formatRowForOutput(targetRow, columns);
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}

	/**
	 * Eine neue Zeile erstellen
	 */
	private static async create(context: IExecuteFunctions, itemIndex: number): Promise<Row> {
		const nodeCollection = context.getNodeParameter('nodeCollection', itemIndex) as string;
		const dataArray = context.getNodeParameter('data.column', itemIndex, []) as any[];

		// Formatiere die Daten für die API
		const data: Record<string, any> = {};
		for (const item of dataArray) {
			if (item.columnId && item.value !== undefined) {
				data[item.columnId] = item.value;
			}
		}

		let endpoint: string;
		let tableId: number;

		if (nodeCollection === 'tables') {
			tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));
			endpoint = `/tables/${tableId}/rows`;
		} else {
			const viewId = ApiHelper.getResourceId(context.getNodeParameter('viewId', itemIndex));
			endpoint = `/views/${viewId}/rows`;

			// Für Views müssen wir die Tabellen-ID ermitteln
			try {
				const view = await ApiHelper.makeApiRequest<any>(context, 'GET', `/views/${viewId}`);
				tableId = view.tableId;
			} catch (error) {
				// Fallback: Erstellen ohne Spalten-Info
				const formattedData = ApiHelper.formatRowDataSimple(data);
				return await ApiHelper.makeApiRequest<Row>(
					context,
					'POST',
					endpoint,
					{ data: formattedData },
				);
			}
		}

		// Spalten-Info laden für korrekte Datenformatierung
		const columns = await ApiHelper.getTableColumns(context, tableId);

		// Erweiterte Formatierung mit Validierung
		const formatOptions: FormatOptions = {
			validateSelections: true,
			dateTimeFormat: 'iso'
		};

		try {
			const formattedData = ApiHelper.formatRowData(data, columns, formatOptions);

			const result = await ApiHelper.makeApiRequest<Row>(
				context,
				'POST',
				endpoint,
				{ data: formattedData },
			);

			return this.formatRowForOutput(result, columns);
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}

	/**
	 * Eine Zeile aktualisieren
	 */
	private static async update(context: IExecuteFunctions, itemIndex: number): Promise<Row> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));
		const rowId = ApiHelper.validateRowId(context.getNodeParameter('rowId', itemIndex));
		const dataArray = context.getNodeParameter('data.column', itemIndex, []) as any[];

		// Formatiere die Daten für die API
		const data: Record<string, any> = {};
		for (const item of dataArray) {
			if (item.columnId && item.value !== undefined) {
				data[item.columnId] = item.value;
			}
		}

		// Spalten-Info laden für korrekte Datenformatierung
		const columns = await ApiHelper.getTableColumns(context, tableId);

		// Erweiterte Formatierung mit Validierung
		const formatOptions: FormatOptions = {
			validateSelections: true,
			dateTimeFormat: 'iso'
		};

		try {
			const formattedData = ApiHelper.formatRowData(data, columns, formatOptions);

			if (Object.keys(formattedData).length === 0) {
				throw new Error('Mindestens eine Spalte muss für die Aktualisierung angegeben werden');
			}

			const result = await ApiHelper.makeApiRequest<Row>(
				context,
				'PUT',
				`/rows/${rowId}`,
				{ data: formattedData },
			);

			return this.formatRowForOutput(result, columns);
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}

	/**
	 * Formatiert eine einzelne Zeile für bessere Ausgabe
	 */
	private static formatRowForOutput(row: Row, columns: Column[]): any {
		const formatted: any = {
			id: row.id,
			tableId: row.tableId,
			createdBy: row.createdBy,
			createdAt: row.createdAt,
			lastEditBy: row.lastEditBy,
			lastEditAt: row.lastEditAt,
			data: {}
		};

		// Daten mit Spaltennamen anstatt IDs formatieren
		if (row.data && Array.isArray(row.data)) {
			for (const item of row.data) {
				const column = columns.find(col => col.id === item.columnId);
				const columnName = column?.title || `column_${item.columnId}`;

				formatted.data[columnName] = this.formatValueForOutput(item.value, column);
			}
		}

		return formatted;
	}

	/**
	 * Formatiert mehrere Zeilen für bessere Ausgabe
	 */
	private static formatRowsForOutput(rows: Row[], columns: Column[]): any[] {
		return rows.map(row => this.formatRowForOutput(row, columns));
	}

	/**
	 * Formatiert einen Wert für die Ausgabe basierend auf Spaltentyp
	 */
	private static formatValueForOutput(value: any, column?: Column): any {
		if (value === null || value === undefined) {
			return null;
		}

		if (!column) {
			return value;
		}

		// Formatierung basierend auf Spalten-Typ
		switch (column.type) {
			case 'datetime':
				// Datum formatieren
				if (typeof value === 'string' && value) {
					try {
						return new Date(value).toISOString();
					} catch {
						return value;
					}
				}
				return value;
			case 'number':
				// Nummer formatieren
				if (typeof value === 'string' && value) {
					const num = parseFloat(value);
					return isNaN(num) ? value : num;
				}
				return value;
			case 'selection':
				// Selection-Werte sind normalerweise schon korrekt formatiert
				return value;
			default:
				return value;
		}
	}

	// ==============================================
	// AI-FRIENDLY METHODS - Optimiert für KI Agents
	// ==============================================

	/**
	 * AI-Friendly Zeile erstellen
	 * Alle Parameter sind durch fixedCollection gleichzeitig verfügbar
	 */
	private static async createAIFriendly(context: IExecuteFunctions, itemIndex: number): Promise<Row> {
		try {
			// Extrahiere Source-Konfiguration
			const sourceConfig = context.getNodeParameter('sourceConfig', itemIndex) as {
				source?: {
					type: 'table' | 'view';
					tableId?: string;
					viewId?: string;
				};
			};

			if (!sourceConfig?.source) {
				throw new Error('Datenquelle-Konfiguration ist erforderlich');
			}

			const { source } = sourceConfig;
			let endpoint: string;
			let tableId: number;

			// Bestimme API-Endpunkt basierend auf Quell-Typ
			if (source.type === 'table') {
				if (!source.tableId) {
					throw new Error('Tabellen-ID ist erforderlich wenn type="table"');
				}
				tableId = parseInt(source.tableId);
				endpoint = `/tables/${tableId}/rows`;
			} else if (source.type === 'view') {
				if (!source.viewId) {
					throw new Error('View-ID ist erforderlich wenn type="view"');
				}
				const viewId = parseInt(source.viewId);
				endpoint = `/views/${viewId}/rows`;

				// Für Views müssen wir die Tabellen-ID ermitteln
				const view = await ApiHelper.makeApiRequest<any>(context, 'GET', `/views/${viewId}`);
				tableId = view.tableId;
			} else {
				throw new Error(`Ungültiger Quell-Typ: ${source.type}`);
			}

			// Extrahiere Zeilen-Daten
			const rowDataConfig = context.getNodeParameter('rowDataConfig', itemIndex) as {
				data?: {
					columns?: Array<{
						column?: {
							columnId: string;
							value: string;
						};
					}>;
				};
			};

			if (!rowDataConfig?.data?.columns || rowDataConfig.data.columns.length === 0) {
				throw new Error('Mindestens eine Spalte mit Daten ist erforderlich');
			}

			// Konvertiere AI-Friendly Format zu Nextcloud API Format
			const data: Record<string, any> = {};
			for (const columnEntry of rowDataConfig.data.columns) {
				if (columnEntry.column?.columnId) {
					data[columnEntry.column.columnId] = columnEntry.column.value || '';
				}
			}

			// Erstelle Zeile
			const response = await ApiHelper.makeApiRequest<Row>(
				context,
				'POST',
				endpoint,
				{ data }
			);

			// Formatiere Ausgabe mit Spalten-Informationen
			const columns = await ApiHelper.getTableColumns(context, tableId);
			return this.formatRowForOutput(response, columns);
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}

	/**
	 * AI-Friendly Alle Zeilen abrufen mit erweiterten Optionen
	 * Alle Filter/Sortierung/Suche Parameter gleichzeitig verfügbar
	 */
	private static async getAllAIFriendly(context: IExecuteFunctions, itemIndex: number): Promise<Row[]> {
		try {
			// Extrahiere Source-Konfiguration
			const sourceConfig = context.getNodeParameter('sourceConfig', itemIndex) as {
				source?: {
					type: 'table' | 'view';
					tableId?: string;
					viewId?: string;
				};
			};

			if (!sourceConfig?.source) {
				throw new Error('Datenquelle-Konfiguration ist erforderlich');
			}

			const { source } = sourceConfig;
			let endpoint: string;
			let tableId: number;

			// Bestimme API-Endpunkt basierend auf Quell-Typ
			if (source.type === 'table') {
				if (!source.tableId) {
					throw new Error('Tabellen-ID ist erforderlich wenn type="table"');
				}
				tableId = parseInt(source.tableId);
				endpoint = `/tables/${tableId}/rows`;
			} else if (source.type === 'view') {
				if (!source.viewId) {
					throw new Error('View-ID ist erforderlich wenn type="view"');
				}
				const viewId = parseInt(source.viewId);
				endpoint = `/views/${viewId}/rows`;

				// Für Views müssen wir die Tabellen-ID ermitteln
				const view = await ApiHelper.makeApiRequest<any>(context, 'GET', `/views/${viewId}`);
				tableId = view.tableId;
			} else {
				throw new Error(`Ungültiger Quell-Typ: ${source.type}`);
			}

			// Extrahiere Query-Optionen
			const queryConfig = context.getNodeParameter('queryConfig', itemIndex, {}) as {
				query?: {
					pagination?: { settings?: { limit?: number; offset?: number } };
					filters?: Array<{ filter?: { columnId: string; operator: string; value: string } }>;
					sorting?: Array<{ sort?: { columnId: string; direction: 'ASC' | 'DESC' } }>;
					search?: { settings?: { term?: string; columns?: string; caseSensitive?: boolean } };
				};
			};

			// Baue Query-Parameter
			const queryParams: Record<string, string> = {};

			// Pagination
			if (queryConfig.query?.pagination?.settings) {
				const { limit, offset } = queryConfig.query.pagination.settings;
				if (limit !== undefined) queryParams.limit = limit.toString();
				if (offset !== undefined) queryParams.offset = offset.toString();
			} else {
				// Standard-Werte
				queryParams.limit = '50';
				queryParams.offset = '0';
			}

			// Filter
			if (queryConfig.query?.filters && queryConfig.query.filters.length > 0) {
				const filters = queryConfig.query.filters
					.map(f => f.filter)
					.filter(f => f?.columnId && f?.operator);
				this.applyFilters(queryParams, filters);
			}

			// Sortierung
			if (queryConfig.query?.sorting && queryConfig.query.sorting.length > 0) {
				const sorting = queryConfig.query.sorting
					.map(s => s.sort)
					.filter(s => s?.columnId && s?.direction);
				this.applySorting(queryParams, sorting);
			}

			// Suche
			if (queryConfig.query?.search?.settings?.term) {
				const searchSettings = queryConfig.query.search.settings;
				const search = {
					term: searchSettings.term,
					searchColumns: searchSettings.columns ? searchSettings.columns.split(',').map(id => id.trim()) : [],
					caseSensitive: searchSettings.caseSensitive
				};
				this.applySearch(queryParams, search);
			}

			// Führe API-Abfrage aus - mit useQueryParams = true
			const rows = await ApiHelper.makeApiRequest<Row[]>(
				context,
				'GET',
				endpoint,
				queryParams,
				true // useQueryParams für GET-Request
			);

			// Spalten-Info laden für bessere Datenformatierung
			const columns = await ApiHelper.getTableColumns(context, tableId);

			// Client-seitige Nachbearbeitung falls erforderlich
			let processedRows = rows;

			// Client-seitige Filterung falls Server-API nicht alle Filter unterstützt
			if (queryConfig.query?.filters && queryConfig.query.filters.length > 0) {
				const filters = queryConfig.query.filters
					.map(f => f.filter)
					.filter(f => f?.columnId && f?.operator);
				processedRows = this.applyClientSideFilters(processedRows, filters, columns);
			}

			// Client-seitige Suche falls Server-API nicht alle Suchoptionen unterstützt
			if (queryConfig.query?.search?.settings?.term) {
				const searchSettings = queryConfig.query.search.settings;
				const search = {
					term: searchSettings.term,
					searchColumns: searchSettings.columns ? searchSettings.columns.split(',').map(id => id.trim()) : [],
					caseSensitive: searchSettings.caseSensitive
				};
				processedRows = this.applyClientSideSearch(processedRows, search, columns);
			}

			// Zeilen für bessere Lesbarkeit formatieren
			return this.formatRowsForOutput(processedRows, columns);
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}

	/**
	 * AI-Friendly Zeile aktualisieren
	 * Alle Parameter durch fixedCollection gleichzeitig verfügbar
	 */
	private static async updateAIFriendly(context: IExecuteFunctions, itemIndex: number): Promise<Row> {
		try {
			// Extrahiere Update-Konfiguration
			const updateDataConfig = context.getNodeParameter('updateDataConfig', itemIndex) as {
				update?: {
					rowId: string;
					tableId: string;
					columns?: Array<{
						column?: {
							columnId: string;
							value: string;
						};
					}>;
				};
			};

			if (!updateDataConfig?.update) {
				throw new Error('Update-Konfiguration ist erforderlich');
			}

			const { update } = updateDataConfig;

			if (!update.rowId) {
				throw new Error('Zeilen-ID ist erforderlich');
			}

			if (!update.tableId) {
				throw new Error('Tabellen-ID ist erforderlich');
			}

			if (!update.columns || update.columns.length === 0) {
				throw new Error('Mindestens eine Spalte mit Daten ist erforderlich');
			}

			const tableId = parseInt(update.tableId);
			const rowId = parseInt(update.rowId);

			// Konvertiere AI-Friendly Format zu Nextcloud API Format
			const data: Record<string, any> = {};
			for (const columnEntry of update.columns) {
				if (columnEntry.column?.columnId) {
					data[columnEntry.column.columnId] = columnEntry.column.value || '';
				}
			}

			// Aktualisiere Zeile
			const endpoint = `/tables/${tableId}/rows/${rowId}`;
			const response = await ApiHelper.makeApiRequest<Row>(
				context,
				'PUT',
				endpoint,
				{ data }
			);

			// Formatiere Ausgabe mit Spalten-Informationen
			const columns = await ApiHelper.getTableColumns(context, tableId);
			return this.formatRowForOutput(response, columns);
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}
}
