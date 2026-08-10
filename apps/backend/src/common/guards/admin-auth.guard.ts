import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { SupabaseService } from '../../supabase/supabase.service';

interface CacheEntry {
  role: string;
  is_active: boolean;
  expiresAt: number;
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 30_000; // 30 seconds

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin token required');
    }

    const token = authHeader.substring(7);

    try {
      // No fallback to JWT_SECRET: admin tokens must use their own secret,
      // otherwise a leak of the guest/host JWT_SECRET also compromises admin auth.
      const secret = this.configService.get<string>('ADMIN_JWT_SECRET') ?? '';

      if (!secret) {
        throw new UnauthorizedException('Server misconfiguration');
      }

      const payload = await this.jwtService.verifyAsync(token, { secret });
      const adminId = payload.sub;

      if (!adminId) {
        throw new UnauthorizedException('Invalid admin token payload');
      }

      // Check in-memory cache first to avoid hammering DB on every request.
      // Opportunistic eviction here (not a timer) — cheap since it only runs on
      // requests, and bounds memory growth for a process handling many distinct
      // admin IDs over time instead of the same few repeatedly.
      const now = Date.now();
      for (const [key, entry] of this.cache) {
        if (entry.expiresAt < now) this.cache.delete(key);
      }
      let cached = this.cache.get(adminId);

      if (!cached || cached.expiresAt < now) {
        const { data: admin, error } = await this.supabaseService.admin
          .from('admins')
          .select('role, is_active')
          .eq('id', adminId)
          .single();

        if (error || !admin) {
          throw new UnauthorizedException('Admin account not found');
        }

        cached = {
          role: admin.role,
          is_active: admin.is_active,
          expiresAt: now + this.CACHE_TTL_MS,
        };
        this.cache.set(adminId, cached);
      }

      if (!cached.is_active) {
        throw new UnauthorizedException('Admin account is deactivated');
      }

      if (!cached.role || !['admin', 'super_admin'].includes(cached.role)) {
        throw new UnauthorizedException('Not authorized as admin');
      }

      (request as any).admin = {
        ...payload,
        role: cached.role,
        is_active: cached.is_active,
      };
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid admin token');
    }
  }
}
