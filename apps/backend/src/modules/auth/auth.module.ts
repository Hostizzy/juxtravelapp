import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    UsersModule,
    WhatsappModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
