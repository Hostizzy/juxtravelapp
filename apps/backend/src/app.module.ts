import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { VerificationModule } from './modules/verification/verification.module';
import { InstagramModule } from './modules/instagram/instagram.module';
import { MatchesModule } from './modules/matches/matches.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    SupabaseModule,
    AuthModule,
    UsersModule,
    WhatsappModule,
    PropertiesModule,
    VerificationModule,
    InstagramModule,
    MatchesModule,
  ],
})
export class AppModule {}
