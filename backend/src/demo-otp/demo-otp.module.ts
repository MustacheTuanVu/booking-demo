import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { DemoOtpController } from './demo-otp.controller';
import { DemoOtpService } from './demo-otp.service';

@Module({
    imports: [UsersModule],
    controllers: [DemoOtpController],
    providers: [DemoOtpService],
    exports: [DemoOtpService],
})
export class DemoOtpModule {}
