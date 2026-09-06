export type ID = string

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  data: T
}
