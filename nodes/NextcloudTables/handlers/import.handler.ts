import { IExecuteFunctions } from 'n8n-workflow';
import { ApiHelper } from '../helpers/api.helper';
import { ImportState } from '../interfaces';

export class ImportHandler {
	static async execute(context: IExecuteFunctions, operation: string, itemIndex: number): Promise<any> {
		switch (operation) {
			case 'importCsv':
				return this.importCsv(context, itemIndex);
			case 'getImportStatus':
				return this.getImportStatus(context, itemIndex);
			default:
				throw new Error(`Unbekannte Operation: ${operation}`);
		}
	}

	/**
	 * CSV-Datei in eine Tabelle importieren
	 */
	private static async importCsv(context: IExecuteFunctions, itemIndex: number): Promise<ImportState> {
		const tableId = ApiHelper.getResourceId(context.getNodeParameter('tableId', itemIndex));
		const csvFile = context.getNodeParameter('csvFile', itemIndex) as string;
		const importOptions = context.getNodeParameter('importOptions', itemIndex, {}) as any;
		const columnMapping = context.getNodeParameter('columnMapping.mapping', itemIndex, []) as any[];

		// CSV-Datei validieren
		if (!csvFile || csvFile.trim().length === 0) {
			throw new Error('CSV-Datei darf nicht leer sein');
		}

		// Import-Body aufbauen
		const body: any = {
			file: csvFile.trim(),
		};

		// Import-Optionen hinzufügen
		if (importOptions) {
			// Header-Zeile
			if (typeof importOptions.hasHeader === 'boolean') {
				body.hasHeader = importOptions.hasHeader;
			}

			// Trennzeichen
			if (importOptions.delimiter) {
				if (importOptions.delimiter === 'custom' && importOptions.customDelimiter) {
					body.delimiter = importOptions.customDelimiter;
				} else if (importOptions.delimiter !== 'custom') {
					body.delimiter = importOptions.delimiter;
				}
			}

			// Textqualifizierer
			if (importOptions.textQualifier) {
				body.textQualifier = importOptions.textQualifier;
			}

			// Zusätzliche Optionen
			if (typeof importOptions.skipEmptyRows === 'boolean') {
				body.skipEmptyRows = importOptions.skipEmptyRows;
			}
			if (typeof importOptions.skipInvalidRows === 'boolean') {
				body.skipInvalidRows = importOptions.skipInvalidRows;
			}
		}

		// Spalten-Mapping hinzufügen
		if (columnMapping && columnMapping.length > 0) {
			body.columnMapping = this.buildColumnMapping(columnMapping);
		}

		try {
			const result = await ApiHelper.makeApiRequest<ImportState>(
				context,
				'POST',
				`/tables/${tableId}/import`,
				body,
			);

			return result;
		} catch (error) {
			const apiError = error as Error;
			throw new Error(`Fehler beim CSV-Import: ${apiError.message}`);
		}
	}

	/**
	 * Status eines Imports abrufen
	 */
	private static async getImportStatus(context: IExecuteFunctions, itemIndex: number): Promise<ImportState> {
		const importId = context.getNodeParameter('importId', itemIndex) as string;

		// Import-ID validieren
		if (!importId || importId.trim().length === 0) {
			throw new Error('Import-ID darf nicht leer sein');
		}

		try {
			return await ApiHelper.makeApiRequest<ImportState>(
				context,
				'GET',
				`/import/${importId.trim()}`,
			);
		} catch (error) {
			const apiError = error as Error;
			throw new Error(`Fehler beim Abrufen des Import-Status: ${apiError.message}`);
		}
	}

	/**
	 * Hilfsfunktion: Spalten-Mapping aufbauen
	 */
	private static buildColumnMapping(mappings: any[]): Record<string, any> {
		const columnMapping: Record<string, any> = {};

		for (const mapping of mappings) {
			if (mapping.csvColumn && mapping.tableColumn) {
				const csvCol = mapping.csvColumn.trim();
				const tableCol = mapping.tableColumn.trim();

				if (csvCol && tableCol) {
					columnMapping[csvCol] = {
						targetColumn: tableCol,
						dataType: mapping.dataType || 'auto',
					};
				}
			}
		}

		return columnMapping;
	}

	/**
	 * Hilfsfunktion: CSV-Inhalt validieren
	 */
	private static validateCsvContent(csvContent: string): boolean {
		if (!csvContent || csvContent.trim().length === 0) {
			return false;
		}

		// Grundlegende CSV-Validierung
		const lines = csvContent.trim().split('\n');
		if (lines.length < 1) {
			return false;
		}

		// Prüfen ob mindestens eine Zeile Inhalt hat
		return lines.some(line => line.trim().length > 0);
	}

	/**
	 * Hilfsfunktion: Trennzeichen validieren
	 */
	private static validateDelimiter(delimiter: string): boolean {
		if (!delimiter) {
			return false;
		}

		// Erlaubte Trennzeichen
		const allowedDelimiters = [',', ';', '\t', '|'];
		return allowedDelimiters.includes(delimiter) || delimiter.length === 1;
	}

	/**
	 * Hilfsfunktion: Import-Optionen validieren
	 */
	private static validateImportOptions(options: any): string[] {
		const errors: string[] = [];

		if (options.delimiter === 'custom' && !options.customDelimiter) {
			errors.push('Benutzerdefiniertes Trennzeichen muss angegeben werden');
		}

		if (options.customDelimiter && !this.validateDelimiter(options.customDelimiter)) {
			errors.push('Ungültiges benutzerdefiniertes Trennzeichen');
		}

		return errors;
	}

	/**
	 * Hilfsfunktion: Spalten-Mapping validieren
	 */
	private static validateColumnMapping(mappings: any[]): string[] {
		const errors: string[] = [];
		const usedCsvColumns = new Set<string>();
		const usedTableColumns = new Set<string>();

		for (const mapping of mappings) {
			if (!mapping.csvColumn || !mapping.tableColumn) {
				errors.push('Alle Spalten-Zuordnungen müssen sowohl CSV- als auch Tabellen-Spalte enthalten');
				continue;
			}

			const csvCol = mapping.csvColumn.trim();
			const tableCol = mapping.tableColumn.trim();

			// Prüfen auf doppelte CSV-Spalten
			if (usedCsvColumns.has(csvCol)) {
				errors.push(`CSV-Spalte "${csvCol}" wird mehrfach verwendet`);
			}
			usedCsvColumns.add(csvCol);

			// Prüfen auf doppelte Tabellen-Spalten
			if (usedTableColumns.has(tableCol)) {
				errors.push(`Tabellen-Spalte "${tableCol}" wird mehrfach verwendet`);
			}
			usedTableColumns.add(tableCol);
		}

		return errors;
	}
}
