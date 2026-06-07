import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService, GoogleStrategy],
    imports: [
        forwardRef(() => UsersModule),
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60d' },
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        MailerModule,
    ],
    exports: [AuthService],
})
export class AuthModule {}
