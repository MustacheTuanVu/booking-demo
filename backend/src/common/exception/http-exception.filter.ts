import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { ApiException } from './ApiException';

@Catch(Error)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (
      exception instanceof ApiException &&
      exception.constructor.name === ApiException.name
    ) {
      response.status(exception.getStatus()).json({
        status: exception.getStatus(),
        message: exception.getResponse(),
        code: exception.code,
      });
    } else {
      // this.logger.error(exception.message);
      // response.status(500).json({
      //     status: 500,
      //     message: 'Server Lỗi Liên hệ 0986439611 để fix',
      //     code: 'INTERNAL_SERVER_ERROR',
      // });
      let isServerError = false;
      switch (exception.constructor.name) {
        case Error.name:
          isServerError = true;
          break;
        case EvalError.name:
          isServerError = true;
          break;
        case RangeError.name:
          isServerError = true;
          break;
        case ReferenceError.name:
          isServerError = true;
          break;
        case SyntaxError.name:
          isServerError = true;
          break;
        case TypeError.name:
          isServerError = true;
          break;
        case URIError.name:
          isServerError = true;
          break;
        default:
          isServerError = false;
      }
      if (isServerError) {
		console.log(exception);
        this.logger.error(exception.message);
        response.status(500).json({
          status: 500,
          message: exception.message,
          code: 'INTERNAL_SERVER_ERROR',
        });
      } else {
        response.status(400).json(exception);
      }
    }
  }
}
