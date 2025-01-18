import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/public';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() signInDto: Record<string, any>) {
    const { email, password } = signInDto;
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // user has id, email
    return await this.authService.generateTokens(user);
  }

  @Post('refresh')
  async refresh(@Body('userId') userId: number) {
    // validate refresh token for specified userId
    const payload = await this.authService.validateRefreshToken(userId);
    if (!payload) {
      throw new UnauthorizedException('Unauthorized, unable to validate token');
    }
    // generate new access token and return to client
    return await this.authService.generateTokens(payload);
  }

  @Get('profile')
  getProfile(@Request() req) { 
    return req.user;
  }
}
