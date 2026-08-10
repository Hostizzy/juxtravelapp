import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { VerificationModule } from './modules/verification/verification.module';
import { InstagramModule } from './modules/instagram/instagram.module';
import { MatchesModule } from './modules/matches/matches.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AIModule } from './modules/ai/ai.module';
import { LocationsModule } from './modules/locations/locations.module';
import { AdminModule } from './modules/admin/admin.module';
import { DiscoverModule } from './modules/discover/discover.module';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    // Single 'default' bucket. A second 'auth' bucket used to sit here at 5 req/min —
    // in @nestjs/throttler v6, every named entry applies to every route unless a
    // route explicitly overrides it, and nothing ever overrode 'auth'. That capped
    // the WHOLE API (including chat polling) at 5 req/min. Auth-specific limits are
    // applied per-route via @Throttle({ default: {...} }) on auth/admin/ai controllers.
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
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
    BookingsModule,
    ConversationsModule,
    PaymentsModule,
    AIModule,
    LocationsModule,
    AdminModule,
    DiscoverModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
