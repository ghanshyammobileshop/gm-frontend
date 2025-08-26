export interface PaginationResponse<T> {
    items: T[];
    data: T[];
    count: number;
}
