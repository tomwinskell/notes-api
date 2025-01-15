import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, inputPassword: string): Promise<any> {
    const user = await this.userService.findOne(email);
    if (user?.password !== inputPassword) {
      throw new UnauthorizedException();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
