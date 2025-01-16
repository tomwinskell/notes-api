import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, inputPassword: string): Promise<any> {
    try {
      // Find user by email
      const user = await this.userService.findOne(email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // compare provided password with stored password
      const isMatch = await bcrypt.compare(inputPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // create payload for JWT token
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const payload = { sub: user.id, email: user.email };

      // return signed JWT token
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      // handle and log errors
      console.error('Login error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error('An error occured with login');
    }
  }
}
