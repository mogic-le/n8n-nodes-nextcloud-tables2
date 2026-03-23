import { Column } from '../interfaces';

export interface FormatOptions {
	columns?: Column[];
	dateTimeFormat?: string;
	timezone?: string;
	validateSelections?: boolean;
	resolveUserGroups?: boolean;
}

/**
 * Datenformatierer für Nextcloud Tables Row-Daten
 */
export class DataFormatter {
	/**
	 * Formatiert Row-Daten basierend auf Spaltentypen
	 */
	static formatRowData(
		data: Record<string, any>,
		columns?: Column[],
		options: FormatOptions = {}
	): Record<string, any> {
		const formattedData: Record<string, any> = {};

		for (const [columnKey, value] of Object.entries(data)) {
			// Leere Werte überspringen
			if (value === undefined || value === null || value === '') {
				continue;
			}

			const columnId = parseInt(columnKey, 10);
			const column = columns?.find(col => col.id === columnId);

			if (column) {
				// Spezifische Formatierung basierend auf Spaltentyp
				formattedData[columnKey] = this.formatColumnValue(value, column, options);
			} else {
				// Fallback: Basis-Formatierung ohne Spalten-Info
				formattedData[columnKey] = this.formatGenericValue(value);
			}
		}

		return formattedData;
	}

	/**
	 * Formatiert einen Wert basierend auf dem Spaltentyp
	 */
	private static formatColumnValue(value: any, column: Column, options: FormatOptions): any {
		switch (column.type) {
			case 'text':
				return this.formatTextValue(value, column);

			case 'number':
				return this.formatNumberValue(value, column);

			case 'datetime':
				return this.formatDateTimeValue(value, column, options);

			case 'selection':
				return this.formatSelectionValue(value, column, options);

			case 'usergroup':
				return this.formatUserGroupValue(value, column, options);

			case 'file':
				return this.formatFileValue(value, column);

			default:
				return this.formatGenericValue(value);
		}
	}

	/**
	 * Formatiert Text-Spalten
	 */
	private static formatTextValue(value: any, column: Column): string {
		const stringValue = String(value);

		// Max-Länge prüfen
		if (column.textMaxLength && stringValue.length > column.textMaxLength) {
			throw new Error(`Text zu lang: ${stringValue.length} Zeichen, Maximum: ${column.textMaxLength}`);
		}

		// Pattern-Validierung
		if (column.textAllowedPattern) {
			const regex = new RegExp(column.textAllowedPattern);
			if (!regex.test(stringValue)) {
				throw new Error(`Text entspricht nicht dem erlaubten Muster: ${column.textAllowedPattern}`);
			}
		}

		return stringValue;
	}

	/**
	 * Formatiert Zahlen-Spalten
	 */
	private static formatNumberValue(value: any, column: Column): number {
		const numValue = parseFloat(value);

		if (isNaN(numValue)) {
			throw new Error(`Ungültiger Zahlenwert: ${value}`);
		}

		// Min/Max-Prüfung - nur wenn Werte gesetzt sind (nicht null oder undefined)
		if (column.numberMin !== undefined && column.numberMin !== null && numValue < column.numberMin) {
			throw new Error(`Zahl zu klein: ${numValue}, Minimum: ${column.numberMin}`);
		}

		if (column.numberMax !== undefined && column.numberMax !== null && numValue > column.numberMax) {
			throw new Error(`Zahl zu groß: ${numValue}, Maximum: ${column.numberMax}`);
		}

		// Dezimalstellen
		if (column.numberDecimals !== undefined) {
			return parseFloat(numValue.toFixed(column.numberDecimals));
		}

		return numValue;
	}

	/**
	 * Formatiert DateTime-Spalten
	 */
	private static formatDateTimeValue(value: any, column: Column, options: FormatOptions): string {
		let dateValue: Date;

		// Verschiedene Eingabeformate verarbeiten
		if (value instanceof Date) {
			dateValue = value;
		} else if (typeof value === 'string') {
			// ISO-Format, Unix-Timestamp oder andere Formate
			if (/^\d+$/.test(value)) {
				// Unix-Timestamp
				dateValue = new Date(parseInt(value, 10) * 1000);
			} else {
				dateValue = new Date(value);
			}
		} else if (typeof value === 'number') {
			// Unix-Timestamp in Sekunden oder Millisekunden
			dateValue = new Date(value > 1e10 ? value : value * 1000);
		} else {
			throw new Error(`Ungültiger DateTime-Wert: ${value}`);
		}

		if (isNaN(dateValue.getTime())) {
			throw new Error(`Ungültiges Datum: ${value}`);
		}

		// Standard-Format für Nextcloud Tables: ISO 8601
		const format = options.dateTimeFormat || 'iso';

		switch (format) {
			case 'iso':
				return dateValue.toISOString();
			case 'unix':
				return Math.floor(dateValue.getTime() / 1000).toString();
			case 'date':
				return dateValue.toISOString().split('T')[0];
			default:
				return dateValue.toISOString();
		}
	}

	private static formatSelectionValue(value: any, column: Column, options: FormatOptions): string | string[] {
		if (!value) {
			return column.selectionDefault || '';
		}

		if (options.validateSelections) {
			var availableOptions = column.selectionOptions;
			if (column.selectionOptions.length == 0) {
				//yes/no fields
				availableOptions = [
					{
						id: 0,
						label: 'no',
					},
					{
						id: 1,
						label: 'yes',
					},
				];
			}

			const valueArray = Array.isArray(value) ? value : [value];

			for (const val of valueArray) {
				if (!availableOptions.some(elem => elem.id == val)) {
					throw new Error(`Ungültige Auswahl: ${val}. Erlaubt: ${availableOptions.map(elem => elem.id).join(', ')}`);
				}
			}
		}

		if (Array.isArray(value)) {
			return value.map(v => String(v));
		}

		return String(value);
	}

	/**
	 * Formatiert UserGroup-Spalten
	 */
	private static formatUserGroupValue(value: any, column: Column, options: FormatOptions): string | string[] {
		if (!value) {
			return column.usergroupDefault || '';
		}

		// TODO: User/Group-ID-Auflösung implementieren wenn resolveUserGroups aktiviert
		if (options.resolveUserGroups) {
			// Hier würde die Auflösung von User-IDs zu Benutzernamen stattfinden
			// Das erfordert zusätzliche API-Calls
		}

		// Mehrfachauswahl unterstützen
		if (column.usergroupMultipleItems) {
			if (Array.isArray(value)) {
				return value.map(v => String(v));
			}
			return [String(value)];
		}

		return String(value);
	}

	/**
	 * Formatiert File-Spalten (für zukünftige Implementierung)
	 */
	private static formatFileValue(value: any, column: Column): any {
		// TODO: File-Attachment-Formatierung implementieren
		// Dies erfordert spezielle Behandlung von File-Uploads

		if (typeof value === 'string' && value.length > 0) {
			// Annahme: File-ID oder File-Path
			return value;
		}

		if (typeof value === 'object' && value.fileId) {
			// File-Objekt mit ID
			return value.fileId;
		}

		return value;
	}

	/**
	 * Generische Wert-Formatierung ohne Spalten-Info
	 */
	private static formatGenericValue(value: any): any {
		// Basis-Sanitization
		if (typeof value === 'string') {
			return value.trim();
		}

		if (typeof value === 'number') {
			return value;
		}

		if (typeof value === 'boolean') {
			return value;
		}

		if (Array.isArray(value)) {
			return value.map(v => this.formatGenericValue(v));
		}

		if (value instanceof Date) {
			return value.toISOString();
		}

		return value;
	}

	/**
	 * Validiert Bulk-Row-Daten
	 */
	static validateBulkData(rows: Record<string, any>[], columns?: Column[]): string[] {
		const errors: string[] = [];

		rows.forEach((row, index) => {
			try {
				this.formatRowData(row, columns, { validateSelections: true });
			} catch (error) {
				errors.push(`Zeile ${index + 1}: ${(error as Error).message}`);
			}
		});

		return errors;
	}

	/**
	 * Konvertiert Row-Daten für Export
	 */
	static convertForExport(
		rows: any[],
		columns?: Column[],
		format: 'csv' | 'json' = 'json'
	): any {
		const convertedRows = rows.map(row => {
			const converted: Record<string, any> = {};

			if (row.data && Array.isArray(row.data)) {
				for (const item of row.data) {
					const column = columns?.find(col => col.id === item.columnId);
					const columnName = column?.title || `column_${item.columnId}`;

					converted[columnName] = this.convertValueForExport(item.value, column);
				}
			}

			return converted;
		});

		if (format === 'csv') {
			return this.convertToCsv(convertedRows);
		}

		return convertedRows;
	}

	/**
	 * Konvertiert einen Wert für Export
	 */
	private static convertValueForExport(value: any, column?: Column): any {
		if (!column) {
			return value;
		}

		switch (column.type) {
			case 'datetime':
				if (value && !isNaN(new Date(value).getTime())) {
					return new Date(value).toLocaleString();
				}
				return value;

			case 'selection':
			case 'usergroup':
				if (Array.isArray(value)) {
					return value.join(', ');
				}
				return value;

			default:
				return value;
		}
	}

	/**
	 * Konvertiert Daten zu CSV-Format
	 */
	private static convertToCsv(data: Record<string, any>[]): string {
		if (data.length === 0) {
			return '';
		}

		const headers = Object.keys(data[0]);
		const csvRows = [headers.join(',')];

		for (const row of data) {
			const values = headers.map(header => {
				const value = row[header];
				if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
					return `"${value.replace(/"/g, '""')}"`;
				}
				return value || '';
			});
			csvRows.push(values.join(','));
		}

		return csvRows.join('\n');
	}
}
