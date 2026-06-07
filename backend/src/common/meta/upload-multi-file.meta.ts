import { ApiBody } from '@nestjs/swagger';

export const ApiMultiFile = (options: { name?: string, isArray?: boolean } = {}): MethodDecorator => {
  const { name = 'file', isArray = false } = options;

  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [name]: isArray
            ? {
                type: 'array',
                items: {
                  type: 'string',
                  format: 'binary',
                },
              }
            : {
                type: 'string',
                format: 'binary',
              },
        },
      },
    })(target, propertyKey, descriptor);
  };
};
