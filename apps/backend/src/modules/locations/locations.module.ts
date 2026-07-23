import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';

@Module({
  imports: [SupabaseModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
