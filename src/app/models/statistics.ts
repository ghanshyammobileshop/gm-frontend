export interface StatisticsModel {
    totalCustomer: number;
    totalInvoice: number;
    totalSellingAmount: number;
}

export interface DbStats {
    totalSize: number;
    formattedTotalSize: string;
    ok: number;
}