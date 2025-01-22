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
import { access } from 'fs';

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

  @Public()
  @Post('refresh')
  async refresh(@Body() refreshDto: { accessToken: string }) {
    try {
      // verify access token (ignoring expiry) to get userId
      const decoded = await this.authService.validateToken(
        refreshDto.accessToken,
        true,
      );

      const { id } = decoded;
      if (!decoded) {
        throw new Error('Invalid access token');
      }

      // validate refresh token for specified userId
      const payload = await this.authService.validateRefreshToken(id);
      if (!payload) {
        throw new Error('Invalid refresh token');
      }
      const { email } = payload;

      // generate new access token and return to client
      return await this.authService.generateTokens({ id, email });
    } catch (error) {
      throw new UnauthorizedException(
        `auth.controller: POST /refresh error: ${error.message}`,
        error,
      );
    }
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
