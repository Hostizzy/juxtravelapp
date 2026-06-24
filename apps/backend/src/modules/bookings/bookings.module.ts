import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [SupabaseModule, ConversationsModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

