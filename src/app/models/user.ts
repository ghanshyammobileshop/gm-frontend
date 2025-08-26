export interface User {
	id: string;
	name: string;
	email: string;
	role: string;
	active: boolean;
	shopAccess: Array<string>;
	accessControls: Array<string>;
}

export interface AccessControlList {
	modules: Array<AccessControlCategory>
}

export interface AccessControlCategory {
	category: string;
	accessControls: Array<AccessControl>;
}

export interface AccessControl {
	label: string;
	value: string;
}
