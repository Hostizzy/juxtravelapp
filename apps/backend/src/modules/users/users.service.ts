import { 
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { CreateUserDto, UserRole } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FieldValue } from 'firebase-admin/firestore';

export interface GuestProfile {
  savedProperties: string[];
  tripBriefs: string[];
}

export interface HostProfile {
  verified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  bio: string;
  hostStory: string;
  payoutDetails: Record<string, unknown>;
}

export interface UserDocument {
  uid: string;
  name: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  guestProfile: GuestProfile;
  hostProfile?: HostProfile;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly COLLECTION = 'users';

  constructor(
    private firebaseService: FirebaseService
  ) {}

  async createOrUpdate(
    uid: string,
    dto: CreateUserDto
  ): Promise<UserDocument> {
    const ref = this.firebaseService.firestore.collection(this.COLLECTION).doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      const newUser = {
        uid,
        name: dto.name,
        phoneNumber: dto.phoneNumber,
        email: dto.email ?? null,
        role: UserRole.GUEST,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        guestProfile: {
          savedProperties: [],
          tripBriefs: [],
        },
      };
      await ref.set(newUser);
      this.logger.log(`New user created: ${uid}`);
    } else {
      await ref.update({
        name: dto.name,
        updatedAt: FieldValue.serverTimestamp(),
      });
      this.logger.log(`User updated: ${uid}`);
    }

    const updated = await ref.get();
    return updated.data() as UserDocument;
  }

  async findById(uid: string): Promise<UserDocument> {
    const ref = this.firebaseService.firestore.collection(this.COLLECTION).doc(uid);
    const snap = await ref.get();

    if (!snap.exists) {
      throw new NotFoundException(`User ${uid} not found`);
    }

    return snap.data() as UserDocument;
  }

  async update(
    uid: string,
    dto: UpdateUserDto
  ): Promise<UserDocument> {
    const ref = this.firebaseService.firestore.collection(this.COLLECTION).doc(uid);
    const snap = await ref.get();
    
    if (!snap.exists) {
      throw new NotFoundException(`User ${uid} not found`);
    }

    await ref.update({
      ...dto,
      updatedAt: FieldValue.serverTimestamp(),
    });

    const updated = await ref.get();
    return updated.data() as UserDocument;
  }

  async becomeHost(
    uid: string,
    bio: string
  ): Promise<UserDocument> {
    const ref = this.firebaseService.firestore.collection(this.COLLECTION).doc(uid);
    const snap = await ref.get();
    
    if (!snap.exists) {
      throw new NotFoundException(`User ${uid} not found`);
    }

    await ref.update({
      role: UserRole.BOTH,
      hostProfile: {
        verified: false,
        verificationStatus: 'pending',
        bio,
        hostStory: '',
        payoutDetails: {},
      },
      updatedAt: FieldValue.serverTimestamp(),
    });

    this.logger.log(`User ${uid} became a host`);

    const updated = await ref.get();
    return updated.data() as UserDocument;
  }
}
