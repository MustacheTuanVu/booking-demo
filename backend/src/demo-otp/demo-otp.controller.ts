import { Body, Post, Query } from '@nestjs/common';
import { Control } from 'src/common/meta/control.meta';
import { Description } from 'src/common/meta/description.meta';
import { Public } from 'src/common/meta/public.meta';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { CheckDemoOtpDto } from './dto/check-demo-otp.dto';
import { DemoOtpService } from './demo-otp.service';

@Control('demo-otp')
export class DemoOtpController {
    constructor(private readonly demoOtpService: DemoOtpService) {}

    @Public()
    @Post('send')
    @Description('Tạo OTP đăng ký dùng cho demo', [
        { status: 200, description: 'Tạo OTP thành công' },
    ])
    sendRegistrationOtp(@Body() user: CreateUserDto) {
        return this.demoOtpService.sendRegistrationOtp(user);
    }

    @Public()
    @Post('verify')
    @Description('Xác thực OTP đăng ký dùng cho demo', [
        { status: 200, description: 'Xác thực OTP thành công' },
    ])
    verifyRegistrationOtp(@Query() query: CheckDemoOtpDto) {
        return this.demoOtpService.verifyRegistrationOtp(
            query.phone,
            query.otp,
            query.email,
        );
    }
}
