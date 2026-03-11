import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	INodeListSearchResult,
} from 'n8n-workflow';

// Handler importieren
import { TableHandler } from './handlers/table.handler';
import { RowHandler } from './handlers/row.handler';
import { ViewHandler } from './handlers/view.handler';
import { ColumnHandler } from './handlers/column.handler';
import { ShareHandler } from './handlers/share.handler';
import { ImportHandler } from './handlers/import.handler';

// Helper importieren
import { NodeLoadOptions, NodeListSearch } from './helpers/node.methods';
import { NextcloudTablesLogger } from './helpers/api.helper';

// Beschreibungen importieren
import { tableOperations, tableFields } from './descriptions/table';
import { rowOperations, rowFields } from './descriptions/row';
import { viewOperations, viewFields } from './descriptions/view';
import { columnOperations, columnFields } from './descriptions/column';
import { shareOperations, shareFields } from './descriptions/share';
import { importOperations, importFields } from './descriptions/import';

export class NextcloudTables implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Nextcloud Tables',
		name: 'nextcloudTables',
		icon: 'file:nextcloud-tables.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Verwalten Sie Ihre Nextcloud Tables - Tabellen, Zeilen und Daten',
		defaults: {
			name: 'Nextcloud Tables',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'nextcloudTablesApi',
				required: true,
			},
		],
		usableAsTool: true,
		requestDefaults: {
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Tabelle',
						value: 'table',
						description: 'Operationen mit Nextcloud Tables',
					},
					{
						name: 'View',
						value: 'view',
						description: 'Operationen mit Tabellen-Views',
					},
					{
						name: 'Spalte',
						value: 'column',
						description: 'Operationen mit Tabellen-Spalten',
					},
					{
						name: 'Share',
						value: 'share',
						description: 'Operationen mit Tabellen-Freigaben',
					},
					{
						name: 'Import',
						value: 'import',
						description: 'CSV-Import in Tabellen',
					},
					{
						name: 'Zeile',
						value: 'row',
						description: 'Operationen mit Tabellen-Zeilen',
					},
				],
				default: 'table',
				description: 'Die Ressource für diese Operation',
			},
			// Operationen und Felder
			...tableOperations,
			...tableFields,
			...viewOperations,
			...viewFields,
			...columnOperations,
			...columnFields,
			...shareOperations,
			...shareFields,
			...importOperations,
			...importFields,
			...rowOperations,
			...rowFields,
		],
	};

	methods = {
		loadOptions: {
			async getTables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return NodeLoadOptions.getTables(this);
			},
			async getViews(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return NodeLoadOptions.getViews(this);
			},
			async getColumns(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return NodeLoadOptions.getColumns(this);
			},
			async getUsers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return NodeLoadOptions.getUsers(this);
			},
			async getGroups(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return NodeLoadOptions.getGroups(this);
			},
			async getShareReceivers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return NodeLoadOptions.getShareReceivers(this);
			},
		},
		listSearch: {
			async getTables(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return NodeListSearch.getTables(this, filter);
			},
			async getViews(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return NodeListSearch.getViews(this, filter);
			},
			async getColumns(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
				return NodeListSearch.getColumns(this, filter);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const startTime = Date.now();
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// Log operation start
				NextcloudTablesLogger.operationStart(resource, operation, {
					itemIndex: i,
					totalItems: items.length
				});

				let result;
				switch (resource) {
					case 'table':
						result = await TableHandler.execute(this, operation, i);
						break;
					case 'view':
						result = await ViewHandler.execute(this, operation, i);
						break;
					case 'column':
						result = await ColumnHandler.execute(this, operation, i);
						break;
					case 'share':
						result = await ShareHandler.execute(this, operation, i);
						break;
					case 'import':
						result = await ImportHandler.execute(this, operation, i);
						break;
					case 'row':
						result = await RowHandler.execute(this, operation, i);
						break;
					default:
						NextcloudTablesLogger.error('OPERATION-ERROR', `Unknown resource: ${resource}`, null, { resource, operation });
						throw new Error(`[N8N-NEXTCLOUD-TABLES] Unbekannte Ressource: ${resource}`);
				}

				const duration = Date.now() - startTime;
				NextcloudTablesLogger.operationSuccess(resource, operation, duration, result);

				if (Array.isArray(result)) {
					result.forEach((element) => returnData.push({ json: element }));
				} else {
					returnData.push({ json: result });
				}
			} catch (error) {
				const duration = Date.now() - startTime;
				const resource = this.getNodeParameter('resource', i, 'unknown') as string;
				const operation = this.getNodeParameter('operation', i, 'unknown') as string;

				NextcloudTablesLogger.operationError(resource, operation, error, duration);

				const nodeError = error as Error;
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: nodeError.message },
					});
				} else {
					throw error;
				}
			}
		}

		return this.prepareOutputData(returnData);
	}
}
