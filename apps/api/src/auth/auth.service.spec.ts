import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    jwtService = {
      sign: vi.fn(() => 'signed-jwt-token'),
    };
    service = new AuthService(prisma, jwtService);
  });

  describe('login', () => {
    it('returns user and JWT token on valid credentials', async () => {
      const passwordHash = await argon2.hash('secret123');
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
        bloodType: 'A+',
        allergies: 'None',
        medications: 'None',
        passwordHash,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.login({ email: 'test@example.com', password: 'secret123' });
      expect(result.token).toBe('signed-jwt-token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.fullName).toBe('Test User');
      expect(jwtService.sign).toHaveBeenCalledWith({ email: mockUser.email, sub: mockUser.id });
    });

    it('throws UnauthorizedException if user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'unknown@example.com', password: 'password' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException on incorrect password', async () => {
      const passwordHash = await argon2.hash('correctPassword');
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash,
      });

      await expect(service.login({ email: 'test@example.com', password: 'wrongPassword' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('creates a new user and returns token', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'new-user-id',
        email: 'new@example.com',
        fullName: 'New User',
        bloodType: '',
        allergies: '',
        medications: '',
      });

      const result = await service.register({
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(result.token).toBe('signed-jwt-token');
      expect(result.user.email).toBe('new@example.com');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('throws BadRequestException if email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({
          name: 'Existing',
          email: 'existing@example.com',
          password: 'password',
        })
      ).rejects.toThrow();
    });
  });
});
