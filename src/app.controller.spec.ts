/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';

function generateUniqueEmail(name: string): string {
  const unique = Date.now() + Math.floor(Math.random() * 1000);
  const safeName = name.replace(/\s+/g, '').toLowerCase();
  return `${safeName}${unique}@example.com`;
}

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});

describe('User Signup (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should signup successfully with valid data', async () => {
    const email = generateUniqueEmail('Test User');
    const res: any = await request(app.getHttpServer())
      .post('/users/signup')
      .send({
        name: 'Test User',
        email,
        password: 'Password1!',
      });
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('should fail with invalid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/signup')
      .send({
        name: 'Test User',
        email: 'not-an-email',
        password: 'Password1!',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('email must be an email');
  });

  it('should fail with weak password', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/signup')
      .send({
        name: 'Test User',
        email: 'test2@example.com',
        password: 'weak',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character.');
  });

  it('should fail with missing fields', async () => {
    const res = await request(app.getHttpServer())
      .post('/users/signup')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('email must be an email');
  });
});