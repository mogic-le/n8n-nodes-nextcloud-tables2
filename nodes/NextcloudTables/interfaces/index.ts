// Basis-Interfaces basierend auf der OpenAPI-Spezifikation

export interface Table {
	id: number;
	title: string;
	emoji?: string;
	description?: string;
	ownership: string;
	ownerDisplayName: string;
	createdBy: string;
	createdAt: string;
	lastEditBy: string;
	lastEditAt: string;
	archived: boolean;
	favorite: boolean;
	isShared: boolean;
	onSharePermissions: {
		read: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
		manage: boolean;
	};
	hasShares: boolean;
	columnsCount: number;
	rowsCount: number;
	views: View[];
}

export interface View {
	id: number;
	title: string;
	emoji?: string;
	tableId: number;
	ownership: string;
	ownerDisplayName: string;
	createdBy: string;
	createdAt: string;
	lastEditBy: string;
	lastEditAt: string;
	description?: string;
	isShared: boolean;
	onSharePermissions: {
		read: boolean;
		create: boolean;
		update: boolean;
		delete: boolean;
		manage: boolean;
	};
	hasShares: boolean;
	favorite: boolean;
	columnsCount: number;
	rowsCount: number;
	filter: Array<{
		columnId: number;
		operator: string;
		value: any;
	}>;
	sort: Array<{
		columnId: number;
		mode: 'ASC' | 'DESC';
	}>;
}

export interface Column {
	id: number;
	title: string;
	tableId: number;
	createdBy: string;
	createdAt: string;
	lastEditBy: string;
	lastEditAt: string;
	type: string;
	subtype: string;
	mandatory: boolean;
	description: string;
	orderWeight: number;
	// Number column specific
	numberDefault?: number;
	numberMin?: number;
	numberMax?: number;
	numberDecimals?: number;
	numberPrefix?: string;
	numberSuffix?: string;
	// Text column specific
	textDefault?: string;
	textAllowedPattern?: string;
	textMaxLength?: number;
	// Selection column specific
	selectionOptions?: string;
	selectionDefault?: string;
	// DateTime column specific
	datetimeDefault?: string;
	// UserGroup column specific
	usergroupDefault?: string;
	usergroupMultipleItems?: boolean;
	usergroupSelectUsers?: boolean;
	usergroupSelectGroups?: boolean;
	usergroupSelectTeams?: boolean;
	showUserStatus?: boolean;
}

export interface Row {
	id: number;
	tableId: number;
	createdBy: string;
	createdAt: string;
	lastEditBy: string;
	lastEditAt: string;
	data: Array<{
		columnId: number;
		value: any;
	}>;
}

export interface Context {
	id: number;
	name: string;
	iconName: string;
	description: string;
	owner: string;
	ownerType: number;
}

export interface Share {
	id: number;
	sender: string;
	receiver: string;
	receiverDisplayName: string;
	receiverType: string;
	nodeId: number;
	nodeType: string;
	permissionRead: boolean;
	permissionCreate: boolean;
	permissionUpdate: boolean;
	permissionDelete: boolean;
	permissionManage: boolean;
	createdAt: string;
	createdBy: string;
}

export interface ImportState {
	found_columns_count: number;
	matching_columns_count: number;
	created_columns_count: number;
	inserted_rows_count: number;
	errors_parsing_count: number;
	errors_count: number;
}

export interface OCSResponse<T> {
	ocs: {
		meta: {
			status: string;
			statuscode: number;
			message?: string;
			totalitems?: string;
			itemsperpage?: string;
		};
		data: T;
	};
}
