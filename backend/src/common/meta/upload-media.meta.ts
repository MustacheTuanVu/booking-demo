import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiMultiFile } from './upload-multi-file.meta';

export function UploadMedia(fileName: string = 'file', multi: boolean = false, num?: number) {
  // Nếu không phải upload nhiều tệp
  if (!multi) {
    return applyDecorators(
      ApiConsumes('multipart/form-data'),
      ApiBody({
        schema: {
          type: 'object',
          properties: {
            [fileName]: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      }),
      UseInterceptors(FileInterceptor(fileName)),
    );
  } else {
    // Nếu upload nhiều tệp
    return applyDecorators(
      ApiConsumes('multipart/form-data'),
      ApiMultiFile({ name: 'files', isArray: true }),
      UseInterceptors(FilesInterceptor('files', num || 10)),
    );
  }
}
