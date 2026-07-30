import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';

@Module({
  imports: [SupabaseModule],
  controllers: [DiscoverController],
  providers: [DiscoverService],
})
export class DiscoverModule {}
