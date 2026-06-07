jest.mock('sharp', () => jest.fn());

import { UsersService } from './users.service';

describe('UsersService', () => {
  describe('createUser', () => {
    it('creates the user locally and returns a local auth token', async () => {
      const usersRepo = {
        findByPhone: jest.fn().mockResolvedValue(null),
        createUser: jest.fn().mockImplementation(async (data) => data),
        deleteUser: jest.fn(),
      };
      const authService = {
        getTokenByPhone: jest.fn().mockResolvedValue('local-token'),
      };
      const service = new UsersService(
        usersRepo as any,
        {} as any,
        {} as any,
        {} as any,
        authService as any,
      );

      const result = await service.createUser({
        name: 'Demo User',
        phone: '0900000000',
        email: 'demo@example.com',
        address: 'Demo address',
        identity_number: '012345678901',
        password: 'secret',
      } as any);

      expect(result).toBe('local-token');
      expect(usersRepo.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Demo User',
          phone: '0900000000',
          email: 'demo@example.com',
        }),
      );
      expect(authService.getTokenByPhone).toHaveBeenCalledWith('0900000000');
      expect(usersRepo.deleteUser).not.toHaveBeenCalled();
    });
  });
});
