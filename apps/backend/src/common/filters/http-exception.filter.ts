import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter
  implements ExceptionFilter {
  private readonly logger = new Logger(
    HttpExceptionFilter.name
  );

  catch(
    exception: unknown, 
    host: ArgumentsHost
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof 
      HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // exception.message on a ValidationPipe failure is just "Bad Request Exception" —
    // the actual field errors live in getResponse().message (string | string[]).
    let message: string | string[] = 'Internal server error';
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      message =
        typeof body === 'object' && body !== null && 'message' in body
          ? (body as { message: string | string[] }).message
          : exception.message;
    }

    this.logger.error(
      `HTTP ${status}: ${message}`
    );

    response.status(status).json({
      success: false,
      data: null,
      message,
      statusCode: status,
    });
  }
}
