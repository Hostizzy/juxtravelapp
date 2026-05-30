import { 
  createParamDecorator,
  ExecutionContext 
} from '@nestjs/common';
import * as adminAuth from 'firebase-admin/auth';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): adminAuth.DecodedIdToken => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as adminAuth.DecodedIdToken;
  },
);
