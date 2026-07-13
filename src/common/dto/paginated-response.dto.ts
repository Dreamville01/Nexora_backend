import { ApiProperty } from '@nestjs/swagger';

/** Shared pagination metadata for list endpoints */
export class PaginationMetaDto {
  @ApiProperty({ example: 42, description: 'Total number of matching items' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number (1-indexed)' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  pageSize: number;

  @ApiProperty({ example: 5, description: 'Total number of pages available' })
  totalPages: number;

  constructor(total: number, page: number, pageSize: number) {
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
  }
}

/** Generic paginated response shape: `{ data, meta }` */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMetaDto;
}
