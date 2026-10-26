import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(() => {
    authService = {
      login: vi.fn(),
      register: vi.fn(),
    };
    controller = new AuthController(authService);
  });

  it('delegates login to authService.login', async () => {
    const dto = { email: 'josim@example.com', password: 'password' };
    const expected = { token: 'jwt-123', user: { email: dto.email, fullName: 'Josim' } };
    authService.login.mockResolvedValue(expected);

    const result = await controller.login(dto);
    expect(result).toBe(expected);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('delegates register to authService.register', async () => {
    const dto = { name: 'Josim', email: 'josim@example.com', password: 'password' };
    const expected = { token: 'jwt-456', user: { email: dto.email, fullName: dto.name } };
    authService.register.mockResolvedValue(expected);

    const result = await controller.register(dto);
    expect(result).toBe(expected);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });
});
