import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/public';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const user = await this.authService.validateUser(loginDto);
    const accessToken = await this.authService.generateTokens(user);
    response.setHeader('Authorization', `Bearer ${accessToken}`);
    return { message: 'Login successful' };
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    try {
      const accessToken = this.authService.extractFromHeader(request);
      // verify access token (ignoring expiry) returns userId
      const decoded = await this.authService.validateToken(accessToken, true);

      if (!decoded) {
        throw new Error('Invalid access token');
      }

      // validate refresh token for specified userId
      const payload = await this.authService.validateRefreshToken(decoded.sub);
      if (!payload) {
        throw new Error('Invalid refresh token');
      }

      // generate new access token using userId and return as header in response
      const newAccessToken = await this.authService.generateTokens(payload);
      response.setHeader('Authorization', `Bearer ${newAccessToken}`);
      return { message: 'Access token successfully renewed' };
    } catch (error) {
      throw new UnauthorizedException(
        `auth.controller: POST /refresh error: ${error.message}`,
        error,
      );
    }
  }

  @Get('profile')
  getProfile(@Req() request: Request) {
    return request;
  }
}
