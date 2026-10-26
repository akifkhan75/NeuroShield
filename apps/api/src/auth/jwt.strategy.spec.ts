import { describe, it, expect } from 'vitest';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('validates JWT payload and extracts user id and email', async () => {
    const strategy = new JwtStrategy();
    const payload = { sub: 'user-99', email: 'josim@example.com' };

    const result = await strategy.validate(payload);
    expect(result).toEqual({ id: 'user-99', email: 'josim@example.com' });
  });
});
