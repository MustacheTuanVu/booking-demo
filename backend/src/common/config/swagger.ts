import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger";
import * as multer from 'multer';


export class Swagger {
    static build(app: INestApplication): void {
        if(process.env.TYPE === 'TEST') {
            const config = new DocumentBuilder()
            .setTitle('Booking Api')
            .setDescription('document api project')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
            const document = SwaggerModule.createDocument(app, config);

            const options: SwaggerCustomOptions = {
                swaggerOptions: {
                  // Giới hạn kích thước tối đa của các request
                  limit: '1mb',
                },
              };

              SwaggerModule.setup('docs', app, document, options);
        }
    }
}