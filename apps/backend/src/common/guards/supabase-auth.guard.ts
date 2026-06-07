import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from 
  '../../supabase/supabase.service';
import { Request } from 'express';

@Injectable()
export class SupabaseAuthGuard 
  implements CanActivate {
  private readonly logger = new Logger(
    SupabaseAuthGuard.name
  );

  constructor(
    private supabaseService: SupabaseService
  ) {}

  async canActivate(
    context: ExecutionContext
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request>();

    const authHeader = 
      request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'No token provided'
      );
    }

    const token = authHeader.split(' ')[1];

    try {
      const { data, error } = await 
        this.supabaseService.admin.auth
          .getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException(
          'Invalid token'
        );
      }

      (request as any)['user'] = data.user;
      return true;
    } catch (error) {
      this.logger.error(
        'Auth guard error', error
      );
      throw new UnauthorizedException(
        'Invalid or expired token'
      );
    }
  }
}
