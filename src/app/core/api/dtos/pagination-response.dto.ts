export interface PaginationResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}
