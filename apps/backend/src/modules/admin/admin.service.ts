import {
  Injectable,
  Logger,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private supabaseService: SupabaseService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const { data: admin, error } = await this.supabaseService.admin
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      this.logger.warn(`[ADMIN] Login failed - not found: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      this.logger.warn(`[ADMIN] Login failed - wrong password: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.supabaseService.admin
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', admin.id);

    // No fallback to JWT_SECRET — must be set explicitly, see admin.module.ts.
    const secret = this.configService.get<string>('ADMIN_JWT_SECRET');

    const token = await this.jwtService.signAsync(
      {
        sub: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      { secret },
    );

    this.logger.log(`[ADMIN] ✅ Login: ${email}`);

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    };
  }

  async createAdmin(
    currentAdminRole: string,
    dto: {
      email: string;
      password: string;
      name: string;
      role?: string;
    },
    createdById: string,
  ) {
    // Only super_admin can create admins
    if (currentAdminRole !== 'super_admin') {
      throw new ForbiddenException('Only super admin can create new admins');
    }

    // Check email unique
    const { data: existing } = await this.supabaseService.admin
      .from('admins')
      .select('id')
      .eq('email', dto.email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(dto.password, 10);

    const { data: newAdmin, error } = await this.supabaseService.admin
      .from('admins')
      .insert({
        email: dto.email.toLowerCase().trim(),
        password_hash,
        name: dto.name,
        role: dto.role ?? 'admin',
        created_by: createdById,
        is_active: true,
      })
      .select('id, email, name, role, created_at')
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    this.logger.log(`[ADMIN] ✅ Created new admin: ${dto.email}`);
    return newAdmin;
  }

  async listAdmins() {
    const { data, error } = await this.supabaseService.admin
      .from('admins')
      .select('id, email, name, role, is_active, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new BadRequestException(error.message);
    return data ?? [];
  }

  async toggleAdmin(
    currentAdminRole: string,
    currentAdminId: string,
    adminId: string,
    isActive: boolean,
  ) {
    if (currentAdminRole !== 'super_admin') {
      throw new ForbiddenException('Only super admin can toggle admins');
    }

    if (adminId === currentAdminId && !isActive) {
      throw new BadRequestException('Cannot deactivate your own account');
    }

    const { error } = await this.supabaseService.admin
      .from('admins')
      .update({ is_active: isActive })
      .eq('id', adminId);

    if (error) throw new BadRequestException(error.message);
    return { success: true };
  }
}
