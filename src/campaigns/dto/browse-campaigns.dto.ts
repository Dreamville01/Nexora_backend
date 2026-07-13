import { Type } from 'class-transformer';
import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/dto/paginated-response.dto';

/** Query DTO for browsing campaigns with pagination, filtering, and sorting */
export class BrowseCampaignsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVE', 'PENDING_APPROVAL', 'COMPLETED', 'CANCELLED', 'REJECTED'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(['newest', 'mostFunded', 'endingSoon'])
  sortBy: string = 'newest';
}

export class BrowseCampaignsResponseDto {
  @ApiProperty({
    isArray: true,
    description: 'Campaigns for the requested page',
  })
  data: any[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
