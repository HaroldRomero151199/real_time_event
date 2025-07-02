import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string = 'Internal server error';
    let errors: string[] | undefined = undefined;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };

        if (Array.isArray(res.message)) {
          errors = res.message;
          message = res.message.join(', ');
        } else {
          message = res.message || 'Internal server error';
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message || 'Internal server error';
    }

    response.status(status).json({
      meta: {
        success: false,
        code: status,
        message,
        errors,
      },
      data: null,
    });
  }
}
