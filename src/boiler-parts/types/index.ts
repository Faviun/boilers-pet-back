import { ApiProperty } from '@nestjs/swagger';
import { Op } from 'sequelize';

export class BoilerParts {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Bosch' })
  boiler_manufacturer: string;

  @ApiProperty({ example: 12345 })
  price: number;

  @ApiProperty({ example: 'Vaillant' })
  parts_manufacturer: string;

  @ApiProperty({ example: 'ABC-12345' })
  vendor_code: string;

  @ApiProperty({ example: 'Теплообменник' })
  name: string;

  @ApiProperty({ example: 'Высококачественный теплообменник для котлов Bosch' })
  description: string;

  @ApiProperty({ example: 'Подходит для моделей Bosch 2000–3000' })
  compatibility: string;

  @ApiProperty({
    example: 'https://example.com/images/boiler-part.jpg',
  })
  images: string;

  @ApiProperty({ example: 5 })
  in_stock: number;

  @ApiProperty({ example: true })
  bestseller: boolean;

  @ApiProperty({ example: false })
  new: boolean;

  @ApiProperty({ example: 123 })
  popularity: number;

  @ApiProperty({ example: '2023-01-31T19:46:45.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-01-31T19:46:45.000Z' })
  updatedAt: string;
}

export class PaginateAndFilterResponse {
  @ApiProperty({ example: 10 })
  count: number;

  @ApiProperty({ type: BoilerParts, isArray: true })
  rows: BoilerParts[];
}

export class Bestsellers extends BoilerParts {
  @ApiProperty({ example: true })
  declare bestseller: boolean;
}

export class GetBestsellersResponse extends PaginateAndFilterResponse {
  @ApiProperty({ type: Bestsellers, isArray: true })
  declare rows: Bestsellers[];
}

export class NewParts extends BoilerParts {
  @ApiProperty({ example: true })
  declare new: boolean;
}

export class GetNewResponse extends PaginateAndFilterResponse {
  @ApiProperty({ type: NewParts, isArray: true })
  declare rows: NewParts[];
}

export class SearchByLetterResponse extends BoilerParts {
  @ApiProperty({ example: 'Теплообменник' })
  declare name: string;
}

export class SearchResponse extends PaginateAndFilterResponse {
  @ApiProperty({ type: SearchByLetterResponse, isArray: true })
  declare rows: SearchByLetterResponse[];
}

export class GetByNameResponse extends BoilerParts {
  @ApiProperty({ example: 'Теплообменник' })
  declare name: string;
}

export class FindOneResponse extends BoilerParts {}

export class SearchRequest {
  @ApiProperty({ example: 'тепл' })
  search: string;
}

export class GetByNameRequest {
  @ApiProperty({ example: 'Теплообменник' })
  name: string;
}

export interface IBoilerPartsQuery {
  limit: string;
  offset: string;
  boiler?: string;
  parts?: string;
  priceFrom?: string;
  priceTo?: string;
}

export interface IBoilerPartsFilter {
  boiler_manufacturer?: string;
  parts_manufacturer?: string;
  price?: {
    [Op.between]: number[];
  };
}
