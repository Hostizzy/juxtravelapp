import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModuleOptions,
  ThrottlerStorage,
  InjectThrottlerOptions,
  InjectThrottlerStorage,
} from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const authHeader = req.headers?.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = this.jwtService.decode(token) as any;
        if (decoded?.sub) {
          return `user_${decoded.sub}`;
        }
      } catch {
        // Fallback
      }
    }

    const ip = req.ip || (req.headers && req.headers['x-forwarded-for']) || 'anonymous';
    const bodyPhone = req.body?.phone;

    if (bodyPhone && typeof bodyPhone === 'string') {
      const cleanPhone = bodyPhone.replace(/\s/g, '');
      return `phone_${cleanPhone}_ip_${ip}`;
    }

    return ip;
  }
}
