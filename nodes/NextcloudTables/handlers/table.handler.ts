import { IExecuteFunctions } from 'n8n-workflow';
import { ApiHelper } from '../helpers/api.helper';
import { Table } from '../interfaces';

export class TableHandler {
	static async execute(context: IExecuteFunctions, operation: string, itemIndex: number): Promise<any> {
		switch (operation) {
			case 'getAll':
				return this.getAll(context, itemIndex);
			case 'get':
				return this.get(context, itemIndex);
			case 'create':
				return this.create(context, itemIndex);
			case 'update':
				return this.update(context, itemIndex);
			case 'delete':
				return this.delete(context, itemIndex);
			default:
				throw new Error(`Unbekannte Operation: ${operation}`);
		}
	}

	/**
	 * Alle Tabellen abrufen
	 */
	private static async getAll(context: IExecuteFunctions, itemIndex: number): Promise<Table[]> {
		return ApiHelper.makeApiRequest<Table[]>(
			context,
			'GET',
			'/tables',
		);
	}

	/**
	 * Eine spezifische Tabelle abrufen
	 */
	private static async get(context: IExecuteFunctions, itemIndex: number): Promise<Table> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));

		return ApiHelper.makeApiRequest<Table>(
			context,
			'GET',
			`/tables/${tableId}`,
		);
	}

	/**
	 * Eine neue Tabelle erstellen
	 */
	private static async create(context: IExecuteFunctions, itemIndex: number): Promise<Table> {
		const title = context.getNodeParameter('title', itemIndex) as string;
		const emoji = context.getNodeParameter('emoji', itemIndex, '') as string;
		const template = context.getNodeParameter('template', itemIndex, '') as string;

		const body: any = {
			title,
		};

		if (emoji) {
			body.emoji = emoji;
		}

		if (template) {
			body.template = template;
		}

		return ApiHelper.makeApiRequest<Table>(
			context,
			'POST',
			'/tables',
			body,
		);
	}

	/**
	 * Eine Tabelle aktualisieren
	 */
	private static async update(context: IExecuteFunctions, itemIndex: number): Promise<Table> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));
		const title = context.getNodeParameter('title', itemIndex, '') as string;
		const emoji = context.getNodeParameter('emoji', itemIndex, '') as string;
		const archived = context.getNodeParameter('archived', itemIndex, false) as boolean;

		const body: any = {};

		if (title) {
			body.title = title;
		}

		if (emoji !== undefined) {
			body.emoji = emoji;
		}

		if (archived !== undefined) {
			body.archived = archived;
		}

		// Nur aktualisieren, wenn es Änderungen gibt
		if (Object.keys(body).length === 0) {
			throw new Error('Mindestens ein Feld muss für die Aktualisierung angegeben werden');
		}

		return ApiHelper.makeApiRequest<Table>(
			context,
			'PUT',
			`/tables/${tableId}`,
			body,
		);
	}

	/**
	 * Eine Tabelle löschen
	 */
	private static async delete(context: IExecuteFunctions, itemIndex: number): Promise<{ success: boolean; message?: string }> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));

		await ApiHelper.makeApiRequest(
			context,
			'DELETE',
			`/tables/${tableId}`,
		);

		return { success: true, message: `Tabelle ${tableId} wurde erfolgreich gelöscht` };
	}
}
