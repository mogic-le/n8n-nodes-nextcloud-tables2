import { IExecuteFunctions } from 'n8n-workflow';
import { ApiHelper } from '../helpers/api.helper';
import { View } from '../interfaces';

export class ViewHandler {
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
			case 'update':
				return this.update(context, itemIndex);
			case 'updateAIFriendly':
				return this.updateAIFriendly(context, itemIndex);
			case 'delete':
				return this.delete(context, itemIndex);
			default:
				throw new Error(`Unbekannte Operation: ${operation}`);
		}
	}

	/**
	 * Alle Views einer Tabelle abrufen
	 */
	private static async getAll(context: IExecuteFunctions, itemIndex: number): Promise<View[]> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));

		return ApiHelper.makeApiRequest<View[]>(
			context,
			'GET',
			`/tables/${tableId}/views`,
		);
	}

	/**
	 * Eine spezifische View abrufen
	 */
	private static async get(context: IExecuteFunctions, itemIndex: number): Promise<View> {
		const viewId = ApiHelper.getResourceId(context.getNodeParameter('viewId', itemIndex));

		return ApiHelper.makeApiRequest<View>(
			context,
			'GET',
			`/views/${viewId}`,
		);
	}

	/**
	 * Eine neue View erstellen
	 */
	private static async create(context: IExecuteFunctions, itemIndex: number): Promise<View> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));
		const title = context.getNodeParameter('title', itemIndex) as string;
		const emoji = context.getNodeParameter('emoji', itemIndex, '') as string;
		const description = context.getNodeParameter('description', itemIndex, '') as string;
		const filterArray = context.getNodeParameter('filter.rule', itemIndex, []) as any[];
		const sortArray = context.getNodeParameter('sort.rule', itemIndex, []) as any[];

		const body: any = {
			title,
		};

		if (emoji) {
			body.emoji = emoji;
		}

		if (description) {
			body.description = description;
		}

		// Filter formatieren
		if (filterArray && filterArray.length > 0) {
			body.filter = filterArray.map((filter) => ({
				columnId: parseInt(filter.columnId, 10),
				operator: filter.operator,
				value: filter.value,
			}));
		}

		// Sortierung formatieren
		if (sortArray && sortArray.length > 0) {
			body.sort = sortArray.map((sort) => ({
				columnId: parseInt(sort.columnId, 10),
				mode: sort.mode,
			}));
		}

		return ApiHelper.makeApiRequest<View>(
			context,
			'POST',
			`/tables/${tableId}/views`,
			body,
		);
	}

	/**
	 * Eine View aktualisieren
	 */
	private static async update(context: IExecuteFunctions, itemIndex: number): Promise<View> {
		const viewId = ApiHelper.getResourceId(context.getNodeParameter('viewId', itemIndex));
		const title = context.getNodeParameter('title', itemIndex, '') as string;
		const emoji = context.getNodeParameter('emoji', itemIndex, '') as string;
		const description = context.getNodeParameter('description', itemIndex, '') as string;
		const filterArray = context.getNodeParameter('filter.rule', itemIndex, []) as any[];
		const sortArray = context.getNodeParameter('sort.rule', itemIndex, []) as any[];

		const body: any = {};

		if (title) {
			body.title = title;
		}

		if (emoji !== undefined) {
			body.emoji = emoji;
		}

		if (description !== undefined) {
			body.description = description;
		}

		// Filter formatieren (nur wenn angegeben)
		if (filterArray && filterArray.length > 0) {
			body.filter = filterArray.map((filter) => ({
				columnId: parseInt(filter.columnId, 10),
				operator: filter.operator,
				value: filter.value,
			}));
		}

		// Sortierung formatieren (nur wenn angegeben)
		if (sortArray && sortArray.length > 0) {
			body.sort = sortArray.map((sort) => ({
				columnId: parseInt(sort.columnId, 10),
				mode: sort.mode,
			}));
		}

		// Nur aktualisieren, wenn es Änderungen gibt
		if (Object.keys(body).length === 0) {
			throw new Error('Mindestens ein Feld muss für die Aktualisierung angegeben werden');
		}

		return ApiHelper.makeApiRequest<View>(
			context,
			'PUT',
			`/views/${viewId}`,
			body,
		);
	}

	/**
	 * Eine View löschen
	 */
	private static async delete(context: IExecuteFunctions, itemIndex: number): Promise<{ success: boolean; message?: string }> {
		const viewId = ApiHelper.getResourceId(context.getNodeParameter('viewId', itemIndex));

		await ApiHelper.makeApiRequest(
			context,
			'DELETE',
			`/views/${viewId}`,
		);

		return { success: true, message: `View ${viewId} wurde erfolgreich gelöscht` };
	}

	// ==============================================
	// AI-FRIENDLY METHODS - Optimiert für KI Agents
	// ==============================================

	/**
	 * AI-Friendly View erstellen
	 * Alle Parameter sind durch fixedCollection gleichzeitig verfügbar
	 */
	private static async createAIFriendly(context: IExecuteFunctions, itemIndex: number): Promise<View> {
		try {
			// Extrahiere Basis-Konfiguration
			const viewConfig = context.getNodeParameter('viewConfig', itemIndex) as {
				basic?: {
					title: string;
					tableId: string;
					emoji?: string;
					description?: string;
				};
			};

			if (!viewConfig?.basic) {
				throw new Error('Basis-Konfiguration ist erforderlich');
			}

			const { basic } = viewConfig;

			if (!basic.title) {
				throw new Error('Titel ist erforderlich');
			}

			if (!basic.tableId) {
				throw new Error('Tabellen-ID ist erforderlich');
			}

			const tableId = parseInt(basic.tableId);

			// Basis-Body aufbauen
			const body: any = {
				title: basic.title,
			};

			if (basic.emoji) {
				body.emoji = basic.emoji;
			}

			if (basic.description) {
				body.description = basic.description;
			}

			// Extrahiere Filter-Konfiguration
			const filterConfig = context.getNodeParameter('filterConfig', itemIndex, {}) as {
				rules?: {
					filters?: Array<{
						filter?: {
							columnId: string;
							operator: string;
							value: string;
						};
					}>;
				};
			};

			// Filter verarbeiten
			if (filterConfig.rules?.filters && filterConfig.rules.filters.length > 0) {
				body.filter = [];
				for (const filterEntry of filterConfig.rules.filters) {
					if (filterEntry.filter?.columnId && filterEntry.filter?.operator) {
						body.filter.push({
							columnId: parseInt(filterEntry.filter.columnId),
							operator: filterEntry.filter.operator,
							value: filterEntry.filter.value || '',
						});
					}
				}
			}

			// Extrahiere Sortierungs-Konfiguration
			const sortConfig = context.getNodeParameter('sortConfig', itemIndex, {}) as {
				rules?: {
					sorting?: Array<{
						sort?: {
							columnId: string;
							direction: 'ASC' | 'DESC';
						};
					}>;
				};
			};

			// Sortierung verarbeiten
			if (sortConfig.rules?.sorting && sortConfig.rules.sorting.length > 0) {
				body.sort = [];
				for (const sortEntry of sortConfig.rules.sorting) {
					if (sortEntry.sort?.columnId && sortEntry.sort?.direction) {
						body.sort.push({
							columnId: parseInt(sortEntry.sort.columnId),
							mode: sortEntry.sort.direction,
						});
					}
				}
			}

			// Erstelle View
			const response = await ApiHelper.makeApiRequest<View>(
				context,
				'POST',
				`/tables/${tableId}/views`,
				body
			);

			return response;
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}

	/**
	 * AI-Friendly View aktualisieren
	 * Alle Parameter durch fixedCollection gleichzeitig verfügbar
	 */
	private static async updateAIFriendly(context: IExecuteFunctions, itemIndex: number): Promise<View> {
		try {
			// Extrahiere Update-Konfiguration
			const updateConfig = context.getNodeParameter('updateConfig', itemIndex) as {
				data?: {
					viewId: string;
					title?: string;
					emoji?: string;
					description?: string;
				};
			};

			if (!updateConfig?.data) {
				throw new Error('Update-Konfiguration ist erforderlich');
			}

			const { data } = updateConfig;

			if (!data.viewId) {
				throw new Error('View-ID ist erforderlich');
			}

			const viewId = parseInt(data.viewId);

			// Basis-Body aufbauen (nur veränderte Felder)
			const body: any = {};

			if (data.title) {
				body.title = data.title;
			}

			if (data.emoji !== undefined) {
				body.emoji = data.emoji;
			}

			if (data.description !== undefined) {
				body.description = data.description;
			}

			// Extrahiere Filter-Konfiguration
			const filterConfig = context.getNodeParameter('filterConfig', itemIndex, {}) as {
				rules?: {
					filters?: Array<{
						filter?: {
							columnId: string;
							operator: string;
							value: string;
						};
					}>;
				};
			};

			// Filter verarbeiten (überschreibt alle bestehenden Filter)
			if (filterConfig.rules?.filters && filterConfig.rules.filters.length > 0) {
				body.filter = [];
				for (const filterEntry of filterConfig.rules.filters) {
					if (filterEntry.filter?.columnId && filterEntry.filter?.operator) {
						body.filter.push({
							columnId: parseInt(filterEntry.filter.columnId),
							operator: filterEntry.filter.operator,
							value: filterEntry.filter.value || '',
						});
					}
				}
			}

			// Extrahiere Sortierungs-Konfiguration
			const sortConfig = context.getNodeParameter('sortConfig', itemIndex, {}) as {
				rules?: {
					sorting?: Array<{
						sort?: {
							columnId: string;
							direction: 'ASC' | 'DESC';
						};
					}>;
				};
			};

			// Sortierung verarbeiten (überschreibt alle bestehenden Sortierungen)
			if (sortConfig.rules?.sorting && sortConfig.rules.sorting.length > 0) {
				body.sort = [];
				for (const sortEntry of sortConfig.rules.sorting) {
					if (sortEntry.sort?.columnId && sortEntry.sort?.direction) {
						body.sort.push({
							columnId: parseInt(sortEntry.sort.columnId),
							mode: sortEntry.sort.direction,
						});
					}
				}
			}

			// Mindestens eine Änderung muss vorhanden sein
			if (Object.keys(body).length === 0) {
				throw new Error('Mindestens ein Feld muss für die Aktualisierung angegeben werden');
			}

			// Aktualisiere View
			const response = await ApiHelper.makeApiRequest<View>(
				context,
				'PUT',
				`/views/${viewId}`,
				body
			);

			return response;
		} catch (error) {
			ApiHelper.handleApiError(error);
		}
	}
}
