import { ApiProperty } from '@nestjs/swagger';

export class MetaDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: 'OK' })
  message: string;

  @ApiProperty({ example: [], required: false })
  errors?: string[];
}

export class ResponseWrapperDto<T> {
  @ApiProperty({ type: MetaDto })
  meta: MetaDto;

  @ApiProperty()
  data: T;
}
