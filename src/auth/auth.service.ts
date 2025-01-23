import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(loginDto: {
    email: string;
    password: string;
  }): Promise<{ sub: number }> {
    try {
      const user = await this.userService.findOne(loginDto.email);
      if (!user) {
        throw new Error('User not found');
      }
      const passwordIsMatch = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!passwordIsMatch) {
        throw new Error('Incorrect password');
      }
      return { sub: user.id };
    } catch (error) {
      throw new UnauthorizedException(
        `auth.service: validateUser error: ${error.message}`,
        error,
      );
    }
  }

  async generateTokens(payload: { sub: number }): Promise<string> {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    // check if user has valid refresh token in database
    const isValidRefreshToken = await this.validateRefreshToken(payload.sub);

    // if no valid refresh token generate and save new refresh token
    if (!isValidRefreshToken) {
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      await this.userService.update({
        id: payload.sub,
        refreshToken,
      });
    }

    return accessToken;
  }

  async validateRefreshToken(id: number): Promise<{ sub: number }> {
    try {
      const user = await this.userService.findOneById(id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const decoded = await this.validateToken(user.refreshToken);
      return {sub: decoded.sub};
    } catch (error) {
      throw new UnauthorizedException(
        'auth.service: validateRefreshToken error:',
        error,
      );
    }
  }

  async validateToken(
    token: string,
    ignoreExpiration: boolean = false,
  ): Promise<{ sub: number }> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
        ignoreExpiration,
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException(
        'auth.service: validateToken error:',
        error,
      );
    }
  }

  extractFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
