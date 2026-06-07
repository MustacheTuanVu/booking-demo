import { RuntimeStateService } from './runtime-state.service';

describe('RuntimeStateService', () => {
    let service: RuntimeStateService;

    beforeEach(() => {
        jest.useFakeTimers();
        service = new RuntimeStateService();
    });

    afterEach(() => {
        service.onModuleDestroy();
        jest.useRealTimers();
    });

    it('tracks event and internal socket IDs without duplicates', async () => {
        await service.addUserToEvent('event-showtime', 'socket-1');
        await service.addUserToEvent('event-showtime', 'socket-1');
        await service.addUserInternal('admin-1');

        expect(await service.getUsersInEvent('event-showtime')).toEqual(['socket-1']);
        expect(await service.getUsersInternal()).toEqual(['admin-1']);

        await service.removeUserFromEvent('event-showtime', 'socket-1');
        await service.deleteUserInternal('admin-1');

        expect(await service.getUsersInEvent('event-showtime')).toEqual([]);
        expect(await service.getUsersInternal()).toEqual([]);
    });

    it('expires OTP data after its TTL', async () => {
        await service.setRegistrationOtp('0900000000', { otp: '12345' }, 300);

        expect(await service.getRegistrationOtp('0900000000')).toBe(JSON.stringify({ otp: '12345' }));

        jest.advanceTimersByTime(300_000);
        await Promise.resolve();

        expect(await service.getRegistrationOtp('0900000000')).toBeNull();
    });

    it('runs pending-order expiration exactly once', async () => {
        const onExpire = jest.fn().mockResolvedValue(undefined);
        await service.setPendingOrder('order-1', { status: 'PENDING' }, onExpire, 300);

        jest.advanceTimersByTime(300_000);
        await Promise.resolve();

        expect(onExpire).toHaveBeenCalledTimes(1);
        expect(await service.getData('ORDER', 'order-1')).toBeNull();
    });

    it('replacing a value cancels the previous expiration callback', async () => {
        const firstExpiry = jest.fn().mockResolvedValue(undefined);
        const secondExpiry = jest.fn().mockResolvedValue(undefined);

        await service.setData('TOKEN', 'access', 'old', 10, firstExpiry);
        await service.setData('TOKEN', 'access', 'new', 20, secondExpiry);

        jest.advanceTimersByTime(10_000);
        await Promise.resolve();
        expect(firstExpiry).not.toHaveBeenCalled();

        jest.advanceTimersByTime(10_000);
        await Promise.resolve();
        expect(secondExpiry).toHaveBeenCalledTimes(1);
    });
});
