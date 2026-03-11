import { IExecuteFunctions } from 'n8n-workflow';
import { ApiHelper } from '../helpers/api.helper';
import { Share } from '../interfaces';

export class ShareHandler {
	static async execute(context: IExecuteFunctions, operation: string, itemIndex: number): Promise<any> {
		switch (operation) {
			case 'getAll':
				return this.getAll(context, itemIndex);
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
	 * Alle Shares einer Tabelle abrufen
	 */
	private static async getAll(context: IExecuteFunctions, itemIndex: number): Promise<Share[]> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));

		return ApiHelper.makeApiRequest<Share[]>(
			context,
			'GET',
			`/tables/${tableId}/shares`,
		);
	}

	/**
	 * Einen neuen Share erstellen
	 */
	private static async create(context: IExecuteFunctions, itemIndex: number): Promise<Share> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));
		const shareType = context.getNodeParameter('shareType', itemIndex) as string;

		// Receiver abhängig vom Share-Typ extrahieren
		let receiver: string;
		if (shareType === 'user') {
			receiver = context.getNodeParameter('userReceiver', itemIndex) as string;
		} else if (shareType === 'group') {
			receiver = context.getNodeParameter('groupReceiver', itemIndex) as string;
		} else {
			throw new Error(`Unbekannter Share-Typ: ${shareType}`);
		}

		const permissionsCollection = context.getNodeParameter('permissions', itemIndex, {}) as any;
		const additionalOptions = context.getNodeParameter('additionalOptions', itemIndex, {}) as any;

		// Basis-Body aufbauen
		const body: any = {
			receiver,
			receiverType: shareType,
		};

		// Anzeigename hinzufügen falls angegeben
		if (additionalOptions.displayName) {
			body.receiverDisplayName = additionalOptions.displayName;
		}

		// Berechtigungen aus fixedCollection extrahieren
		const permissions = permissionsCollection?.permission?.[0] || null;

		// Berechtigungen hinzufügen
		if (permissions) {
			body.permissionRead = permissions.read || false;
			body.permissionCreate = permissions.create || false;
			body.permissionUpdate = permissions.update || false;
			body.permissionDelete = permissions.delete || false;
			body.permissionManage = permissions.manage || false;
		} else {
			// Standard-Berechtigung: nur Lesen
			body.permissionRead = true;
			body.permissionCreate = false;
			body.permissionUpdate = false;
			body.permissionDelete = false;
			body.permissionManage = false;
		}

		return ApiHelper.makeApiRequest<Share>(
			context,
			'POST',
			`/tables/${tableId}/shares`,
			body,
		);
	}

	/**
	 * Berechtigungen eines Shares aktualisieren
	 */
	private static async update(context: IExecuteFunctions, itemIndex: number): Promise<Share> {
		const shareId = context.getNodeParameter('shareId', itemIndex) as string;
		const permissionsCollection = context.getNodeParameter('permissions', itemIndex, {}) as any;

		// Berechtigungen aus fixedCollection extrahieren
		const permissions = permissionsCollection?.permission?.[0] || null;

		// Berechtigungen-Body aufbauen
		const body: any = {};

		if (permissions) {
			body.permissionRead = permissions.read || false;
			body.permissionCreate = permissions.create || false;
			body.permissionUpdate = permissions.update || false;
			body.permissionDelete = permissions.delete || false;
			body.permissionManage = permissions.manage || false;
		} else {
			throw new Error('Mindestens eine Berechtigung muss angegeben werden');
		}

		return ApiHelper.makeApiRequest<Share>(
			context,
			'PUT',
			`/shares/${shareId}`,
			body,
		);
	}

	/**
	 * Einen Share löschen
	 */
	private static async delete(context: IExecuteFunctions, itemIndex: number): Promise<{ success: boolean; message?: string }> {
		const shareId = context.getNodeParameter('shareId', itemIndex) as string;

		await ApiHelper.makeApiRequest(
			context,
			'DELETE',
			`/shares/${shareId}`,
		);

		return { success: true, message: `Share ${shareId} wurde erfolgreich gelöscht` };
	}

	/**
	 * Hilfsfunktion: Berechtigungen validieren
	 */
	private static validatePermissions(permissions: any): boolean {
		if (!permissions) {
			return false;
		}

		// Mindestens eine Berechtigung muss true sein
		return permissions.read ||
			   permissions.create ||
			   permissions.update ||
			   permissions.delete ||
			   permissions.manage;
	}

	/**
	 * Hilfsfunktion: Share-Typ validieren
	 */
	private static validateShareType(shareType: string): boolean {
		const validTypes = ['user', 'group'];
		return validTypes.includes(shareType);
	}

	/**
	 * Hilfsfunktion: Empfänger validieren (grundlegend)
	 */
	private static validateReceiver(receiver: string): boolean {
		// Grundlegende Validierung: nicht leer und keine Sonderzeichen
		if (!receiver || receiver.trim().length === 0) {
			return false;
		}

		// Einfache Regex für Nextcloud-Benutzernamen (Buchstaben, Zahlen, Unterstrich, Bindestrich)
		const receiverRegex = /^[a-zA-Z0-9_-]+$/;
		return receiverRegex.test(receiver.trim());
	}
}
