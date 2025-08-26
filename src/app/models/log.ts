export interface Log {
    id: string;
    userId: string;
    role: string;
    email: string;
    name: string;
    type: string;
    action: string;
    operation: string;
    description: string;
    data: any;
    synced: Boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ConstantsValue {
    logTypes: Array<string>;
    logActions: Array<string>;
    logOperations: Array<string>;
}
