import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(
    inputEmail: string,
    inputPassword: string,
  ): Promise<{ id: number; email: string }> {
    try {
      const user = await this.userService.findOne(inputEmail);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const passwordIsMatch = await bcrypt.compare(
        inputPassword,
        user.password,
      );
      if (!passwordIsMatch) {
        throw new UnauthorizedException('Incorrect password');
      }
      const { id, email } = user;
      return { id, email };
    } catch (error) {
      throw new UnauthorizedException(
        'auth.service: validateUser error:',
        error,
      );
    }
  }

  async generateTokens(user: { id: number; email: string }): Promise<string> {
    const { id } = user;
    const accessToken = this.jwtService.sign(user, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(user, { expiresIn: '7d' });

    // TODO: only update refreshToken if expired
    await this.userService.update({
      id,
      refreshToken,
    });
    return accessToken;
  }

  async validateRefreshToken(
    id: number,
  ): Promise<{ id: number; email: string }> {
    try {
      const user = await this.userService.findOneById(id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return await this.validateToken(user.refreshToken);
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
  ): Promise<{ id: number; email: string }> {
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
}
