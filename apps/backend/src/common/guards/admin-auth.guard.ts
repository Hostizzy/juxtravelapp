import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin token required');
    }

    const token = authHeader.substring(7);

    try {
      const secret =
        this.configService.get<string>('ADMIN_JWT_SECRET') ??
        this.configService.get<string>('JWT_SECRET') ??
        '';

      if (!secret) {
        throw new UnauthorizedException('Server misconfiguration');
      }

      const payload = await this.jwtService.verifyAsync(token, { secret });

      // Verify it's an admin token (has role field)
      if (!payload.role || !['admin', 'super_admin'].includes(payload.role)) {
        throw new UnauthorizedException('Not an admin');
      }

      (request as any).admin = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid admin token');
    }
  }
}
