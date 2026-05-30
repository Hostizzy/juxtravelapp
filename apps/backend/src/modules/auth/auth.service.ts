import { 
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private usersService: UsersService,
  ) {}

  async verifyAndSync(dto: VerifyTokenDto) {
    try {
      const decoded = await this.firebaseService.auth.verifyIdToken(dto.idToken);

      const user = await this.usersService.createOrUpdate(
        decoded.uid,
        {
          name: dto.name,
          phoneNumber: dto.phoneNumber,
          email: dto.email,
        }
      );

      return {
        uid: user.uid,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        guestProfile: user.guestProfile,
        hostProfile: user.hostProfile,
      };
    } catch (error) {
      this.logger.error('Auth verify failed', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
