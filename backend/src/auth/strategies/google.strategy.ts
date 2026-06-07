import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.BE_URI + '/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      // Tìm hoặc tạo user dựa trên thông tin của Google
      const user = await this.authService.validateGoogleUser(profile);
      // Tạo JWT cho người dùng đã đăng nhập thành công
      const token = await this.authService.generateJWT(user, profile.id);
      return done(null, { token });
    } catch (error) {
      console.log('error', error)
      return error
    }
    
  }
}
