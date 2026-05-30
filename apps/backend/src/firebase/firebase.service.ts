import { 
  Injectable, 
  OnModuleInit,
  Logger 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(
    FirebaseService.name
  );

  constructor(
    private configService: ConfigService
  ) {}

  onModuleInit(): void {
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>(
            'firebase.projectId'
          ),
          clientEmail: this.configService.get<string>(
            'firebase.clientEmail'
          ),
          privateKey: this.configService.get<string>(
            'firebase.privateKey'
          ),
        }),
      });
      this.logger.log('Firebase Admin initialized');
    }
  }

  get firestore(): admin.firestore.Firestore {
    return admin.firestore();
  }

  get auth(): admin.auth.Auth {
    return admin.auth();
  }
}
