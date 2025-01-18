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

  async validateUser(email: string, inputPassword: string): Promise<any> {
    const user = await this.userService.findOne(email);

    if (user && (await bcrypt.compare(inputPassword, user.password))) {
      const { password, refreshToken, ...result } = user;
      return result;
    }
    return null;
  }

  async generateTokens(user: { id: number; email: string }) {
    const { id, email } = user;
    const payload = { id, email };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // TODO: only update refreshToken if expired
    await this.userService.update({
      id,
      refreshToken,
    });
    return accessToken;
  }

  async validateRefreshToken(id: number): Promise<any> {
    try {
      const user = await this.userService.findOneById(id);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return await this.validateToken(user.refreshToken);
    } catch (error) {
      throw new UnauthorizedException('Validate refresh token error:', error);
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Validate token error:', error);
    }
  }
}
