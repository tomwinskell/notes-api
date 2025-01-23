import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from 'src/public';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check request to see if @Public decorator applies
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // get the request data
    const request = context.switchToHttp().getRequest();

    try {
      const token = this.authService.extractFromHeader(request);
      if (!token) {
        throw new Error('Unauthorized, no token');
      }

      const payload = await this.authService.validateToken(token);
      if (!payload) {
        throw new Error('Unauthorized, unable to validate token');
      }

      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException(
        `auth.guard error: ${error.message}`,
        error,
      );
    }
    return true;
  }
}
