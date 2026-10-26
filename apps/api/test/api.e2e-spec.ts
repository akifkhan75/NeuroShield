import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('NeuroShield API (e2e integration)', () => {
  let app: INestApplication;
  let authToken: string;
  const testUser = {
    name: 'E2E Tester',
    email: `e2e_${Date.now()}@example.com`,
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Root and Health', () => {
    it('GET / returns Hello World!', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('Authentication Flow (/api/v1/auth)', () => {
    it('POST /api/v1/auth/signup registers a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.fullName).toBe(testUser.name);
    });

    it('POST /api/v1/auth/login logs in successfully with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      authToken = response.body.token;
      expect(typeof authToken).toBe('string');
    });

    it('POST /api/v1/auth/login rejects invalid credentials with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('Protected Endpoints (Security Enforcement)', () => {
    it('GET /api/v1/settings rejects unauthenticated requests with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/settings')
        .expect(401);
    });

    it('GET /api/v1/danger-zones rejects unauthenticated requests with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/danger-zones')
        .expect(401);
    });

    it('GET /api/v1/ai/fake-call-script rejects unauthenticated requests with 401', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/ai/fake-call-script')
        .expect(401);
    });
  });

  describe('Settings Flow (/api/v1/settings)', () => {
    it('GET /api/v1/settings returns user profile and security preferences', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('personalInfo');
      expect(response.body).toHaveProperty('security');
      expect(response.body).toHaveProperty('trustedContacts');
      expect(response.body.personalInfo.fullName).toBe(testUser.name);
    });

    it('PUT /api/v1/settings updates user profile and security preferences', async () => {
      const updatePayload = {
        personalInfo: {
          fullName: 'E2E Tester Updated',
          bloodType: 'O+',
          allergies: 'None',
        },
        security: {
          locationSharingEnabled: false,
          accidentDetectionEnabled: true,
          shakeToSosEnabled: true,
        },
        trustedContacts: [
          { name: 'Primary Contact', phone: '+15551234567' },
        ],
      };

      const response = await request(app.getHttpServer())
        .put('/api/v1/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatePayload)
        .expect(200);

      expect(response.body.personalInfo.fullName).toBe('E2E Tester Updated');
      expect(response.body.personalInfo.bloodType).toBe('O+');
      expect(response.body.security.locationSharingEnabled).toBe(false);
      expect(response.body.trustedContacts).toHaveLength(1);
      expect(response.body.trustedContacts[0].name).toBe('Primary Contact');
    });
  });

  describe('Danger Zones Flow (/api/v1/danger-zones)', () => {
    it('POST /api/v1/danger-zones creates a reported danger zone', async () => {
      const zonePayload = {
        type: 'Suspicious Activity',
        severity: 'high',
        description: 'Suspicious activity reported via E2E integration test',
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/danger-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zonePayload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('location');
      expect(response.body.location).toHaveProperty('top');
      expect(response.body.location).toHaveProperty('left');
      expect(response.body.type).toBe(zonePayload.type);
      expect(response.body.severity).toBe(zonePayload.severity);
    });

    it('GET /api/v1/danger-zones retrieves the list of danger zones', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/danger-zones')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('location');
      expect(response.body[0]).toHaveProperty('severity');
    });
  });

  describe('AI Services Flow (/api/v1/ai)', () => {
    it('GET /api/v1/ai/fake-call-script returns fake call script', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/ai/fake-call-script')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('callerName');
      expect(response.body).toHaveProperty('script');
      expect(Array.isArray(response.body.script)).toBe(true);
    });

    it('GET /api/v1/ai/self-defense-tips returns self defense guidance', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/ai/self-defense-tips')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/ai/safety-chat returns safety advice response', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/ai/safety-chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ message: 'What should I do if walking alone at night?' })
        .expect(201);

      expect(response.body).toHaveProperty('response');
      expect(typeof response.body.response).toBe('string');
    });
  });
});
