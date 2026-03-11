import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	NodeOperationError,
	IDataObject
} from 'n8n-workflow';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Column } from '../interfaces';
import { DataFormatter, FormatOptions } from './data.formatter';

/**
 * Zentrale Logging-Klasse für bessere Log-Kennzeichnung und Grep-Fähigkeit
 */
export class NextcloudTablesLogger {
	private static readonly NODE_PREFIX = '[N8N-NEXTCLOUD-TABLES]';
	
	/**
	 * Debug-Level Logging (nur in Development/Verbose)
	 */
	static debug(context: string, message: string, data?: any): void {
		const timestamp = new Date().toISOString();
		const logMessage = `${this.NODE_PREFIX} [DEBUG] [${context}] ${message}`;
		console.debug(`${timestamp} ${logMessage}`, data ? JSON.stringify(data, null, 2) : '');
	}
	
	/**
	 * Info-Level Logging für wichtige Operationen
	 */
	static info(context: string, message: string, data?: any): void {
		const timestamp = new Date().toISOString();
		const logMessage = `${this.NODE_PREFIX} [INFO] [${context}] ${message}`;
		console.log(`${timestamp} ${logMessage}`, data ? JSON.stringify(data, null, 2) : '');
	}
	
	/**
	 * Warning-Level Logging für potentielle Probleme
	 */
	static warn(context: string, message: string, data?: any): void {
		const timestamp = new Date().toISOString();
		const logMessage = `${this.NODE_PREFIX} [WARN] [${context}] ${message}`;
		console.warn(`${timestamp} ${logMessage}`, data ? JSON.stringify(data, null, 2) : '');
	}
	
	/**
	 * Error-Level Logging für Fehler
	 */
	static error(context: string, message: string, error?: any, data?: any): void {
		const timestamp = new Date().toISOString();
		const logMessage = `${this.NODE_PREFIX} [ERROR] [${context}] ${message}`;
		const errorInfo = error ? {
			message: error.message,
			stack: error.stack,
			statusCode: error.statusCode || error.response?.status
		} : null;
		
		console.error(`${timestamp} ${logMessage}`, {
			error: errorInfo,
			additionalData: data
		});
	}
	
	/**
	 * API-Request Logging für Debugging
	 */
	static apiRequest(method: string, endpoint: string, body?: any): void {
		this.debug('API-REQUEST', `${method} ${endpoint}`, {
			method,
			endpoint,
			hasBody: !!body,
			bodySize: body ? JSON.stringify(body).length : 0
		});
	}
	
	/**
	 * API-Response Logging für Debugging
	 */
	static apiResponse(method: string, endpoint: string, statusCode?: number, duration?: number): void {
		this.debug('API-RESPONSE', `${method} ${endpoint} -> ${statusCode || 'unknown'}`, {
			method,
			endpoint,
			statusCode,
			duration: duration ? `${duration}ms` : 'unknown'
		});
	}
	
	/**
	 * Operation-Start Logging
	 */
	static operationStart(resource: string, operation: string, context?: any): void {
		this.info('OPERATION-START', `${resource}.${operation}`, {
			resource,
			operation,
			context
		});
	}
	
	/**
	 * Operation-Success Logging
	 */
	static operationSuccess(resource: string, operation: string, duration?: number, result?: any): void {
		this.info('OPERATION-SUCCESS', `${resource}.${operation} completed`, {
			resource,
			operation,
			duration: duration ? `${duration}ms` : 'unknown',
			resultType: result ? typeof result : 'none',
			resultSize: result && typeof result === 'object' ? Object.keys(result).length : 0
		});
	}
	
	/**
	 * Operation-Error Logging
	 */
	static operationError(resource: string, operation: string, error: any, duration?: number): void {
		this.error('OPERATION-ERROR', `${resource}.${operation} failed`, error, {
			resource,
			operation,
			duration: duration ? `${duration}ms` : 'unknown'
		});
	}
	
	/**
	 * Validation-Error Logging
	 */
	static validationError(context: string, field: string, value: any, reason: string): void {
		this.warn('VALIDATION-ERROR', `${field} validation failed: ${reason}`, {
			context,
			field,
			value: typeof value === 'string' ? value : JSON.stringify(value),
			reason
		});
	}
}

export class ApiHelper {
	/**
	 * Macht einen API-Request an die Nextcloud Tables API
	 */
	static async makeApiRequest<T>(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		method: 'GET' | 'POST' | 'PUT' | 'DELETE',
		endpoint: string,
		body?: any,
		useQueryParams: boolean = false,
	): Promise<T> {
		const startTime = Date.now();
		
		// Log API Request
		NextcloudTablesLogger.apiRequest(method, endpoint, body);
		
		const credentials = await context.getCredentials('nextcloudTablesApi');
		const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');

		let url = `${serverUrl}/index.php/apps/tables/api/1${endpoint}`;

		if (useQueryParams && body) {
			const queryParams = new URLSearchParams();
			for (const [key, value] of Object.entries(body)) {
				if (value !== undefined && value !== null) {
					queryParams.append(key, String(value));
				}
			}
			url += `?${queryParams.toString()}`;
			body = undefined;
		}

		const options: IRequestOptions = {
			method: method as IHttpRequestMethods,
			url,
			headers: {
				'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'OCS-APIRequest': 'true',
			},
			json: true,
			rejectUnauthorized: false,
		};

		if (body && !useQueryParams) {
			options.body = body;
		}

		try {
			const response = await context.helpers.request(options);
			const duration = Date.now() - startTime;
			
			// Log successful response
			NextcloudTablesLogger.apiResponse(method, endpoint, 200, duration);
			
			return response;
		} catch (error: any) {
			const duration = Date.now() - startTime;
			const statusCode = error.statusCode || error.response?.status;
			
			// Log error response
			NextcloudTablesLogger.apiResponse(method, endpoint, statusCode, duration);
			NextcloudTablesLogger.error('API-ERROR', `${method} ${endpoint} failed`, error, {
				statusCode,
				duration,
				url: options.url
			});
			
			if (error.statusCode) {
				switch (error.statusCode) {
					case 400:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Ungültige Anfrage (400). Prüfen Sie die übermittelten Daten.`);
					case 401:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Authentifizierung fehlgeschlagen (401). Prüfen Sie Benutzername und Passwort.`);
					case 403:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Zugriff verweigert (403). Prüfen Sie die Berechtigung für diese Aktion.`);
					case 404:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Ressource nicht gefunden (404). Prüfen Sie die URL und ob die Nextcloud Tables App installiert ist.`);
					case 409:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Konflikt (409). Die Ressource existiert bereits oder ist in Verwendung.`);
					case 422:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Daten können nicht verarbeitet werden (422). Prüfen Sie die Eingabevalidierung.`);
					case 429:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Zu viele Anfragen (429). Versuchen Sie es später erneut.`);
					case 500:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Serverfehler (500). Prüfen Sie die Nextcloud-Logs.`);
					case 502:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Bad Gateway (502). Nextcloud-Server nicht erreichbar.`);
					case 503:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Service nicht verfügbar (503). Nextcloud ist temporär nicht erreichbar.`);
					case 504:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Gateway Timeout (504). Anfrage dauerte zu lange.`);
					default:
						throw new Error(`[N8N-NEXTCLOUD-TABLES] API-Fehler (${error.statusCode}): ${error.message}`);
				}
			}
			throw new Error(`[N8N-NEXTCLOUD-TABLES] Unbekannter API-Fehler: ${error.message}`);
		}
	}

	/**
	 * Erstellt die Basis-URL für API-Endpunkte
	 */
	static getBaseUrl(serverUrl: string): string {
		return `${serverUrl.replace(/\/$/, '')}/ocs/v2.php/apps/tables/api/2`;
	}

	/**
	 * Validiert eine Tabellen-ID
	 */
	static validateTableId(tableId: any): number {
		const id = parseInt(tableId, 10);
		if (isNaN(id) || id <= 0) {
			NextcloudTablesLogger.validationError('TABLE-ID', 'tableId', tableId, 'Ungültige Tabellen-ID');
			throw new Error('[N8N-NEXTCLOUD-TABLES] Ungültige Tabellen-ID');
		}
		return id;
	}

	/**
	 * Validiert eine View-ID
	 */
	static validateViewId(viewId: any): number {
		const id = parseInt(viewId, 10);
		if (isNaN(id) || id <= 0) {
			NextcloudTablesLogger.validationError('VIEW-ID', 'viewId', viewId, 'Ungültige View-ID');
			throw new Error('[N8N-NEXTCLOUD-TABLES] Ungültige View-ID');
		}
		return id;
	}

	/**
	 * Validiert eine Spalten-ID
	 */
	static validateColumnId(columnId: any): number {
		const id = parseInt(columnId, 10);
		if (isNaN(id) || id <= 0) {
			NextcloudTablesLogger.validationError('COLUMN-ID', 'columnId', columnId, 'Ungültige Spalten-ID');
			throw new Error('[N8N-NEXTCLOUD-TABLES] Ungültige Spalten-ID');
		}
		return id;
	}

	/**
	 * Validiert eine Zeilen-ID
	 */
	static validateRowId(rowId: any): number {
		const id = parseInt(rowId, 10);
		if (isNaN(id) || id <= 0) {
			NextcloudTablesLogger.validationError('ROW-ID', 'rowId', rowId, 'Ungültige Zeilen-ID');
			throw new Error('[N8N-NEXTCLOUD-TABLES] Ungültige Zeilen-ID');
		}
		return id;
	}

	/**
	 * Formatiert Zeilendaten für API-Requests
	 */
	static formatRowData(
		data: Record<string, any>, 
		columns?: Column[], 
		options: FormatOptions = {}
	): Record<string, any> {
		return DataFormatter.formatRowData(data, columns, options);
	}

	/**
	 * Formatiert Zeilendaten mit einfacher Fallback-Logik (Legacy)
	 */
	static formatRowDataSimple(data: Record<string, any>): Record<string, any> {
		const formattedData: Record<string, any> = {};
		
		for (const [key, value] of Object.entries(data)) {
			if (value !== undefined && value !== null && value !== '') {
				formattedData[key] = value;
			}
		}
		
		return formattedData;
	}

	/**
	 * Lädt Spalten-Informationen für eine Tabelle (Helper für Formatierung)
	 */
	static async getTableColumns(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		tableId: number
	): Promise<Column[]> {
		try {
			return await this.makeApiRequest<Column[]>(
				context,
				'GET',
				`/tables/${tableId}/columns`,
			);
		} catch (error) {
			return [];
		}
	}

	/**
	 * Konvertiert Resource Locator zu ID - Production Version
	 */
	static getResourceId(resourceLocator: any): number {
		// Log validation attempt
		NextcloudTablesLogger.debug('RESOURCE-VALIDATION', 'Validating resource locator', {
			type: typeof resourceLocator,
			value: resourceLocator
		});

		// Robuste Validierung - Alle möglichen NaN-Quellen abfangen
		if (resourceLocator === null || resourceLocator === undefined || 
			resourceLocator === 'null' || resourceLocator === 'undefined' ||
			resourceLocator === 'NaN' || 
			(typeof resourceLocator === 'number' && isNaN(resourceLocator))) {
			
			NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator', resourceLocator, 'Resource Locator ist null, undefined oder NaN');
			throw new Error('[N8N-NEXTCLOUD-TABLES] Resource Locator ist erforderlich aber nicht gesetzt oder ungültig');
		}

		if (typeof resourceLocator === 'number') {
			if (resourceLocator <= 0 || isNaN(resourceLocator)) {
				NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator', resourceLocator, 'Nummer muss positiv sein');
				throw new Error('[N8N-NEXTCLOUD-TABLES] Ungültige ID: Muss eine positive Zahl sein');
			}
			NextcloudTablesLogger.debug('RESOURCE-VALIDATION', 'Valid number resource locator', { id: resourceLocator });
			return resourceLocator;
		}
		
		if (typeof resourceLocator === 'string') {
			if (resourceLocator.trim() === '') {
				NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator', resourceLocator, 'String ist leer');
				throw new Error('[N8N-NEXTCLOUD-TABLES] Resource Locator ist leer - ID ist erforderlich');
			}
			const id = parseInt(resourceLocator, 10);
			if (isNaN(id) || id <= 0) {
				NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator', resourceLocator, 'String kann nicht zu positiver Zahl konvertiert werden');
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Ungültige ID: "${resourceLocator}" ist keine gültige Zahl`);
			}
			NextcloudTablesLogger.debug('RESOURCE-VALIDATION', 'Valid string resource locator converted', { original: resourceLocator, converted: id });
			return id;
		}
		
		if (resourceLocator && typeof resourceLocator === 'object') {
			// Prüfe __rl Struktur
			if (resourceLocator.__rl === true) {
				const value = resourceLocator.value;
				const mode = resourceLocator.mode;
				
				NextcloudTablesLogger.debug('RESOURCE-VALIDATION', 'Processing __rl resource locator', { mode, value });
				
				if (!value || value === '') {
					NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator.value', value, `Value ist leer bei mode: ${mode}`);
					throw new Error(`[N8N-NEXTCLOUD-TABLES] Resource Locator Value ist leer (mode: ${mode}) - Eine ID ist erforderlich`);
				}
				
				if (mode === 'id' || mode === 'list') {
					const id = parseInt(value, 10);
					if (isNaN(id) || id <= 0) {
						NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator.value', value, `Value kann nicht zu positiver Zahl konvertiert werden (mode: ${mode})`);
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Ungültige ID in Resource Locator: "${value}" ist keine gültige Zahl`);
					}
					NextcloudTablesLogger.debug('RESOURCE-VALIDATION', 'Valid __rl resource locator', { mode, value, converted: id });
					return id;
				} else {
					NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator.mode', mode, 'Unbekannter Mode');
					throw new Error(`[N8N-NEXTCLOUD-TABLES] Unbekannter Resource Locator Mode: ${mode}`);
				}
			}
			
			// Legacy Format Support
			if (resourceLocator.mode && resourceLocator.value) {
				const value = resourceLocator.value;
				const mode = resourceLocator.mode;
				
				NextcloudTablesLogger.debug('RESOURCE-VALIDATION', 'Processing legacy resource locator', { mode, value });
				
				if (!value || value === '') {
					NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator.value', value, 'Legacy value ist leer');
					throw new Error('[N8N-NEXTCLOUD-TABLES] Resource Locator Value ist leer - Eine ID ist erforderlich');
				}
				const id = parseInt(value, 10);
				if (isNaN(id) || id <= 0) {
					NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator.value', value, 'Legacy value kann nicht zu positiver Zahl konvertiert werden');
					throw new Error(`[N8N-NEXTCLOUD-TABLES] Ungültige ID: "${value}" ist keine gültige Zahl`);
				}
				NextcloudTablesLogger.debug('RESOURCE-VALIDATION', 'Valid legacy resource locator', { mode, value, converted: id });
				return id;
			}
		}
		
		NextcloudTablesLogger.validationError('RESOURCE-LOCATOR', 'resourceLocator', resourceLocator, 'Unbekanntes Format');
		throw new Error(`[N8N-NEXTCLOUD-TABLES] Ungültiger Resource Locator Format: ${JSON.stringify(resourceLocator)}`);
	}

	/**
	 * Prüft ob ein Fehler wiederholbar ist
	 */
	private static isNonRetryableError(error: any): boolean {
		const statusCode = error.response?.status || error.statusCode;
		if (statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429) {
			return true;
		}
		
		const errorMessage = error.message?.toLowerCase() || '';
		if (errorMessage.includes('unauthorized') || 
			errorMessage.includes('forbidden') ||
			errorMessage.includes('not found')) {
			return true;
		}
		
		return false;
	}

	/**
	 * Sleep-Hilfsfunktion für Retry-Delays
	 */
	private static sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Verbesserte Fehlerbehandlung mit spezifischen HTTP-Status-Codes
	 */
	static handleApiError(error: any): never {
		const statusCode = error.response?.status || error.statusCode;
		const errorMessage = error.response?.body?.ocs?.meta?.message || error.message;
		
		// Log the error for debugging
		NextcloudTablesLogger.error('API-ERROR-HANDLER', `HTTP ${statusCode} Error`, error, {
			statusCode,
			errorMessage
		});
		
		switch (statusCode) {
			case 400:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Ungültige Anfrage: ${errorMessage || 'Überprüfen Sie Ihre Eingabedaten'}`);
			case 401:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Nicht autorisiert: ${errorMessage || 'Überprüfen Sie Ihre Anmeldedaten'}`);
			case 403:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Zugriff verweigert: ${errorMessage || 'Keine Berechtigung für diese Operation'}`);
			case 404:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Nicht gefunden: ${errorMessage || 'Die angeforderte Ressource existiert nicht'}`);
			case 409:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Konflikt: ${errorMessage || 'Die Ressource ist bereits vorhanden oder wird verwendet'}`);
			case 422:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Validierungsfehler: ${errorMessage || 'Die Eingabedaten sind ungültig'}`);
			case 429:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Zu viele Anfragen: ${errorMessage || 'Versuchen Sie es später erneut'}`);
			case 500:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Serverfehler: ${errorMessage || 'Ein interner Fehler ist aufgetreten'}`);
			case 502:
			case 503:
			case 504:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] Dienst nicht verfügbar: ${errorMessage || 'Der Server ist vorübergehend nicht erreichbar'}`);
			default:
				throw new Error(`[N8N-NEXTCLOUD-TABLES] API-Fehler: ${errorMessage || 'Ein unbekannter Fehler ist aufgetreten'}`);
		}
	}

	/**
	 * Lädt alle verfügbaren Tabellen
	 */
	static async getTables(context: ILoadOptionsFunctions): Promise<any[]> {
		try {
			const tables = await this.makeApiRequest<any[]>(
				context,
				'GET',
				'/tables',
			);
			return tables || [];
		} catch (error: any) {
			return [];
		}
	}

	/**
	 * Nextcloud Sharee API Request (für Benutzer-/Gruppensuche)
	 */
	static async nextcloudShareeApiRequest(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		method: string,
		endpoint: string,
		body: IDataObject = {},
	): Promise<IDataObject> {
		const credentials = await context.getCredentials('nextcloudTablesApi');
		const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');
		const username = credentials.username as string;
		const password = credentials.password as string;

		const url = `${serverUrl}/ocs/v2.php/apps/files_sharing/api/v1${endpoint}`;

		const config: AxiosRequestConfig = {
			method,
			url,
			headers: {
				'OCS-APIRequest': 'true',
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			auth: {
				username,
				password,
			},
		};

		if (Object.keys(body).length > 0) {
			config.data = body;
		}

		try {
			const response: AxiosResponse = await axios(config);
			const data = response.data as { ocs?: { data?: IDataObject } };
			return data?.ocs?.data || (response.data as IDataObject);
		} catch (error: unknown) {
			const axiosError = error as { response?: { status?: number; data?: { ocs?: { meta?: { message?: string } } } } };
			NextcloudTablesLogger.error('SHAREE-API-ERROR', 'Nextcloud Sharee API request failed', axiosError);
			throw new NodeOperationError(
				context.getNode(),
				`[N8N-NEXTCLOUD-TABLES] Sharee API-Fehler: ${axiosError.response?.data?.ocs?.meta?.message || 'Unbekannter Fehler'}`
			);
		}
	}

	/**
	 * Nextcloud OCS Users API Request (für Benutzer-/Gruppensuche)
	 */
	static async nextcloudOcsUsersApiRequest(
		context: IExecuteFunctions | ILoadOptionsFunctions,
		method: string,
		endpoint: string,
		body: IDataObject = {},
	): Promise<IDataObject> {
		const credentials = await context.getCredentials('nextcloudTablesApi');
		const serverUrl = (credentials.serverUrl as string).replace(/\/$/, '');
		const username = credentials.username as string;
		const password = credentials.password as string;

		const url = `${serverUrl}/ocs/v2.php/cloud${endpoint}`;

		const config: AxiosRequestConfig = {
			method,
			url,
			headers: {
				'OCS-APIRequest': 'true',
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			auth: {
				username,
				password,
			},
		};

		if (Object.keys(body).length > 0) {
			config.data = body;
		}

		try {
			const response: AxiosResponse = await axios(config);
			const data = response.data as { ocs?: { data?: IDataObject } };
			return data?.ocs?.data || (response.data as IDataObject);
		} catch (error: unknown) {
			const axiosError = error as { response?: { status?: number; data?: { ocs?: { meta?: { message?: string } } } } };
			NextcloudTablesLogger.error('OCS-USERS-API-ERROR', 'Nextcloud OCS Users API request failed', axiosError);
			throw new NodeOperationError(
				context.getNode(),
				`[N8N-NEXTCLOUD-TABLES] OCS Users API-Fehler: ${axiosError.response?.data?.ocs?.meta?.message || 'Unbekannter Fehler'}`
			);
		}
	}
} 