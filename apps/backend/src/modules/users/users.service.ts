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

  private async ensureGuestProfile(
    userId: string
  ): Promise<void> {
    const { data: existing } = await this.supabaseService.admin
      .from('guest_profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existing) {
      try {
        const { error } = await this.supabaseService.admin
          .from('guest_profiles')
          .insert({
            user_id: userId,
            saved_properties: [],
            trip_briefs: [],
          });
        if (error) throw error;
      } catch (err) {
        this.logger.warn(`Failed to insert guest_profile with trip_briefs, trying fallback without trip_briefs:`, err);
        await this.supabaseService.admin
          .from('guest_profiles')
          .insert({
            user_id: userId,
            saved_properties: [],
          });
      }
      this.logger.log(
        `Auto-created guest_profile for ${userId}`
      );
    }
  }

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
    await this.ensureGuestProfile(userId);

    const { data: profile, error: fetchError } = await this.supabaseService.admin
      .from('guest_profiles')
      .select('id, saved_properties')
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchError || !profile) {
      this.logger.error('Guest profile not found', fetchError);
      throw new Error('Guest profile not found');
    }

    const current: string[] = profile.saved_properties ?? [];

    if (!current.includes(propertyId)) {
      const updated = [...current, propertyId];
      const { error: updateError } = await this.supabaseService.admin
        .from('guest_profiles')
        .update({ saved_properties: updated })
        .eq('user_id', userId);

      if (updateError) {
        this.logger.error('Save property failed', updateError);
        throw new Error('Failed to save property');
      }
    }

    return { success: true };
  }

  async getSavedProperties(
    userId: string
  ): Promise<unknown[]> {
    await this.ensureGuestProfile(userId);

    const { data: profile } = await this.supabaseService.admin
      .from('guest_profiles')
      .select('saved_properties')
      .eq('user_id', userId)
      .maybeSingle();

    const savedIds: string[] = profile?.saved_properties ?? [];

    if (savedIds.length === 0) return [];

    const { data: properties, error } = await this.supabaseService.admin
      .from('properties')
      .select('*')
      .in('id', savedIds);

    if (error) {
      this.logger.error('Fetch saved properties failed', error);
      return [];
    }

    return properties ?? [];
  }

  async getMyTrips(userId: string) {
    try {
      const { data, error } = await this.supabaseService.admin
        .from('trip_briefs')
        .select(`
          *,
          match_results(
            property_id,
            score,
            properties(name, photos, location, price_per_night)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (err) {
      this.logger.warn('Failed to join trip_briefs with match_results, falling back to simple select', err);
      const { data } = await this.supabaseService.admin
        .from('trip_briefs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return data ?? [];
    }
  }
}
