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
  async login(@Body() loginDto: { email: string; password: string }) {
    const { email, password } = loginDto;
    const user = await this.authService.validateUser(email, password);
    return await this.authService.generateTokens(user);
  }

  @Post('refresh')
  async refresh(@Body() accessToken: string) {
    try {
      // verify access token (ignoring expiry) to get userId
      const decoded = await this.authService.validateToken(accessToken, true);
      const { id, email } = decoded;
      if (!decoded) {
        throw new UnauthorizedException('Invalid access token');
      }

      // validate refresh token for specified userId
      const payload = await this.authService.validateRefreshToken(id);
      if (!payload) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // generate new access token and return to client
      return await this.authService.generateTokens(payload);
    } catch (error) {
      throw new UnauthorizedException(
        'auth.controller: POST /refresh error: ',
        error,
      );
    }
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
