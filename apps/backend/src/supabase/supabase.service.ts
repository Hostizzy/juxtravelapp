import { Injectable, OnModuleInit, Logger }
  from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient }
  from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(
    SupabaseService.name
  );
  
  private _adminClient: SupabaseClient;
  private _anonClient: SupabaseClient;

  constructor(
    private configService: ConfigService
  ) {}

  onModuleInit(): void {
    const url = this.configService.get<string>(
      'supabase.url'
    ) ?? '';
    
    const serviceRoleKey = 
      this.configService.get<string>(
        'supabase.serviceRoleKey'
      ) ?? '';
    
    const anonKey = 
      this.configService.get<string>(
        'supabase.anonKey'
      ) ?? '';

    // Admin client - full access
    this._adminClient = createClient(
      url, 
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );

    // Anon client - for auth operations
    this._anonClient = createClient(url, anonKey);

    this.logger.log('Supabase clients initialized');
  }

  get admin(): SupabaseClient {
    return this._adminClient;
  }

  get anon(): SupabaseClient {
    return this._anonClient;
  }
}
