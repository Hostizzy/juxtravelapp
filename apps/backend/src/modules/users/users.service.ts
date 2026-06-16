import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { BecomeHostDto } from './dto/become-host.dto';

export interface CreateUserData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface UserData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  guest_profile?: unknown;
  host_profile?: unknown;
}

export interface GuestProfileData {
  saved_properties?: string[];
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private supabaseService: SupabaseService
  ) { }

  async createUser(
    data: CreateUserData
  ): Promise<UserData> {
    // Create user
    const { data: user, error } = await this.supabaseService.admin
      .from('users')
      .insert({
        id: data.id,
        name: data.name,
        phone: data.phone,
        email: data.email,
        role: 'guest',
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Create user failed', error);
      throw new Error('Failed to create user');
    }

    // Create guest profile
    await this.supabaseService.admin
      .from('guest_profiles')
      .insert({ user_id: data.id });

    this.logger.log(`User created: ${data.id}`);

    return user as UserData;
  }

  async findById(
    id: string
  ): Promise<UserData | null> {
    const { data, error } = await this.supabaseService.admin
      .from('users')
      .select(`
          *,
          guest_profile:guest_profiles(*),
          host_profile:host_profiles(*)
        `)
      .eq('id', id)
      .single();

    if (error) return null;
    return data as UserData;
  }

  async findByPhone(
    phone: string
  ): Promise<UserData | null> {
    const { data, error } = await this.supabaseService.admin
      .from('users')
      .select(`
          *,
          guest_profile:guest_profiles(*),
          host_profile:host_profiles(*)
        `)
      .eq('phone', phone)
      .single();

    if (error) return null;
    return data as UserData;
  }

  async updateUser(
    id: string,
    dto: UpdateUserDto | { name: string }
  ): Promise<UserData> {
    const { data, error } = await this.supabaseService.admin
      .from('users')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new NotFoundException('User not found');
    }

    return data as UserData;
  }

  async becomeHost(
    id: string,
    dto: BecomeHostDto
  ): Promise<UserData> {
    // Update role to 'both'
    await this.supabaseService.admin
      .from('users')
      .update({
        role: 'both',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Check if host profile exists using maybeSingle to avoid 406 error
    const { data: existingHost } = await this.supabaseService.admin
      .from('host_profiles')
      .select('id')
      .eq('user_id', id)
      .maybeSingle();

    if (!existingHost) {
      // Create host profile
      await this.supabaseService.admin
        .from('host_profiles')
        .insert({
          user_id: id,
          bio: dto.bio ?? '',
          verified: false,
          verification_status: 'pending',
        });
    }

    this.logger.log(`User ${id} became a host`);

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async saveProperty(
    userId: string,
    propertyId: string
  ): Promise<{ success: boolean }> {
    const { data: profile } = await this.supabaseService.admin
      .from('guest_profiles')
      .select('saved_properties')
      .eq('user_id', userId)
      .single();

    const savedProfile = profile as GuestProfileData | null;
    const current = savedProfile?.saved_properties ?? [];

    if (!current.includes(propertyId)) {
      await this.supabaseService.admin
        .from('guest_profiles')
        .update({
          saved_properties: [
            ...current, propertyId
          ]
        })
        .eq('user_id', userId);
    }

    return { success: true };
  }

  async getSavedProperties(
    userId: string
  ): Promise<unknown[]> {
    const { data: profile } = await this.supabaseService.admin
      .from('guest_profiles')
      .select('saved_properties')
      .eq('user_id', userId)
      .single();

    const savedProfile = profile as GuestProfileData | null;
    const savedIds = savedProfile?.saved_properties ?? [];

    if (savedIds.length === 0) return [];

    const { data: properties } = await this.supabaseService.admin
      .from('properties')
      .select('*')
      .in('id', savedIds);

    return (properties as unknown[]) ?? [];
  }
}
