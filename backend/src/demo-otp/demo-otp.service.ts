import { Injectable } from '@nestjs/common';
import { MessageCode } from 'src/common/exception/MessageCode';
import { RuntimeStateService } from 'src/runtime-state/runtime-state.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { UserStatus } from 'src/users/enum/status.enum';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class DemoOtpService {
    private static readonly OTP_TTL_SECONDS = 5 * 60;

    constructor(
        private readonly runtimeStateService: RuntimeStateService,
        private readonly usersService: UsersService,
    ) {}

    async sendRegistrationOtp(user: CreateUserDto) {
        const otp = this.generateOtp();
        await this.runtimeStateService.setRegistrationOtp(
            user.phone,
            { ...user, otp },
            DemoOtpService.OTP_TTL_SECONDS,
        );

        return {
            otp,
            expiresIn: DemoOtpService.OTP_TTL_SECONDS,
            mode: 'demo',
        };
    }

    async verifyRegistrationOtp(
        phone: string,
        otp: string,
        email?: string,
    ) {
        const cachedOtp =
            await this.runtimeStateService.getRegistrationOtp(phone);
        if (!cachedOtp) {
            throw MessageCode.TIME.OVERDUE_TIME;
        }

        const data = JSON.parse(cachedOtp);
        if (data.otp !== otp) {
            throw MessageCode.REQUEST.BAD_REQUEST;
        }

        if (email) {
            return this.usersService.updateUserByCondition(
                { email },
                { phone, isDelete: UserStatus.ACTIVE },
            );
        }

        delete data.otp;
        data.isDelete = UserStatus.ACTIVE;
        return this.usersService.createUser(data);
    }

    private generateOtp(length = 5) {
        const digits = '0123456789';
        let otp = '';
        for (let index = 0; index < length; index++) {
            otp += digits[Math.floor(Math.random() * digits.length)];
        }
        return otp;
    }
}
