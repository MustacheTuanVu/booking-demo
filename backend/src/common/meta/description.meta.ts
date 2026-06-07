import { applyDecorators, HttpCode } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export const Description = (summary: string, des: IDescription[]) => {
  const b = ApiOperation({
    summary,
  });
  const a = des.map((element) =>
    ApiResponse({ status: element.status, description: element.description }),
  );
  return applyDecorators(b, ...a, HttpCode(200), ApiBearerAuth());
};
export type IDescription = {
  status: number;
  description: string;
};
