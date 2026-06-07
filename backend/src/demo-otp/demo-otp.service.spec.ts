jest.mock('sharp', () => jest.fn());

import { DemoOtpService } from './demo-otp.service';

describe('DemoOtpService', () => {
    const runtimeStateService = {
        setRegistrationOtp: jest.fn(),
        getRegistrationOtp: jest.fn(),
    };
    const usersService = {
        createUser: jest.fn(),
        updateUserByCondition: jest.fn(),
    };
    let service: DemoOtpService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new DemoOtpService(
            runtimeStateService as any,
            usersService as any,
        );
    });

    it('stores and returns a local registration OTP', async () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.1);
        runtimeStateService.setRegistrationOtp.mockResolvedValue(undefined);

        const result = await service.sendRegistrationOtp({
            phone: '0900000000',
            name: 'Demo User',
            password: 'secret',
        } as any);

        expect(result).toEqual({
            otp: '11111',
            expiresIn: 300,
            mode: 'demo',
        });
        expect(runtimeStateService.setRegistrationOtp).toHaveBeenCalledWith(
            '0900000000',
            expect.objectContaining({ otp: '11111', name: 'Demo User' }),
            300,
        );
        jest.restoreAllMocks();
    });

    it('creates a new active user after valid OTP verification', async () => {
        runtimeStateService.getRegistrationOtp.mockResolvedValue(
            JSON.stringify({
                phone: '0900000000',
                name: 'Demo User',
                password: 'secret',
                otp: '12345',
            }),
        );
        usersService.createUser.mockResolvedValue({ token: 'local-token' });

        const result = await service.verifyRegistrationOtp(
            '0900000000',
            '12345',
        );

        expect(usersService.createUser).toHaveBeenCalledWith(
            expect.objectContaining({
                phone: '0900000000',
                isDelete: 'ACTIVE',
            }),
        );
        expect(result).toEqual({ token: 'local-token' });
    });

    it('activates an existing email user after valid OTP verification', async () => {
        runtimeStateService.getRegistrationOtp.mockResolvedValue(
            JSON.stringify({ phone: '0900000000', otp: '12345' }),
        );
        usersService.updateUserByCondition.mockResolvedValue({
            token: 'local-token',
        });

        await service.verifyRegistrationOtp(
            '0900000000',
            '12345',
            'demo@example.com',
        );

        expect(usersService.updateUserByCondition).toHaveBeenCalledWith(
            { email: 'demo@example.com' },
            { phone: '0900000000', isDelete: 'ACTIVE' },
        );
    });
});
