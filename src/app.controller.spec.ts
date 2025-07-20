/* eslint-disable @typescript-eslint/no-unsafe-argument */
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
    expect(res.body.user.email).toBe(email);
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

describe('User Auth (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let email: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should signup and signin successfully, then access /me', async () => {
    email = generateUniqueEmail('Auth User');
    // Signup
    await request(app.getHttpServer())
      .post('/users/signup')
      .send({
        name: 'Auth User',
        email,
        password: 'Password1!',
      })
      .expect(201);
    // Signin
    const signinRes = await request(app.getHttpServer())
      .post('/users/signin')
      .send({
        email,
        password: 'Password1!',
      });
    expect(signinRes.status).toBe(201);
    expect(signinRes.body.token).toBeDefined();
    token = signinRes.body.token;
    // /me
    const meRes = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(email);
    expect(meRes.body.user.name).toBe('Auth User');
    expect(meRes.body.user.password).toBeUndefined();
  });

  it('should fail signin with wrong password', async () => {
    email = generateUniqueEmail('WrongPass User');
    await request(app.getHttpServer())
      .post('/users/signup')
      .send({
        name: 'WrongPass User',
        email,
        password: 'Password1!',
      })
      .expect(201);
    const res = await request(app.getHttpServer())
      .post('/users/signin')
      .send({
        email,
        password: 'WrongPassword!',
      });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should not allow /me without token', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me');
    expect(res.status).toBe(401);
  });

  it('should not allow /me with invalid token', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
  });
});

describe('Movies CRUD', () => {
  let app: INestApplication;
  let token: string;
  let movieId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    // Signup and signin to get token
    const email = `movietest${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/users/signup')
      .send({ name: 'Movie User', email, password: 'Password1!' })
      .expect(201);
    const signinRes = await request(app.getHttpServer())
      .post('/users/signin')
      .send({ email, password: 'Password1!' });
    token = signinRes.body.token;
  });

  it('should create a movie', async () => {
    const res = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieName: 'Test Movie',
        movieDes: 'A test movie',
        yearOfPublished: 2022,
        moviePoster: 'http://example.com/poster.jpg',
      });
    expect(res.status).toBe(201);
    expect(res.body.movie).toBeDefined();
    expect(res.body.movie.movieName).toBe('Test Movie');
    movieId = res.body.movie.id;
  });

  it('should not create a movie with duplicate movieName', async () => {
    const res = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieName: 'Test Movie',
        movieDes: 'Another test movie',
        yearOfPublished: 2023,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('movieName must be unique');
  });

  it('should get all movies (with pagination and search)', async () => {
    const res = await request(app.getHttpServer())
      .get('/movies?search=Test&page=1&limit=8')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.movies)).toBe(true);
    expect(res.body.total).toBeGreaterThan(0);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(8);
  });

  it('should get one movie by id', async () => {
    const res = await request(app.getHttpServer())
      .get(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.movie.id).toBe(movieId);
  });

  it('should update a movie by creator', async () => {
    const res = await request(app.getHttpServer())
      .put(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieName: 'Updated Movie',
        movieDes: 'Updated description',
        yearOfPublished: 2023,
        moviePoster: 'http://example.com/updated.jpg',
      });
    expect(res.status).toBe(200);
    expect(res.body.movie.movieName).toBe('Updated Movie');
  });

  it('should not update a movie by another user', async () => {
    // Signup/signin as another user
    const email = `otheruser${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/users/signup')
      .send({ name: 'Other User', email, password: 'Password1!' })
      .expect(201);
    const signinRes = await request(app.getHttpServer())
      .post('/users/signin')
      .send({ email, password: 'Password1!' });
    const otherToken = signinRes.body.token;
    const res = await request(app.getHttpServer())
      .put(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        movieName: 'Hacked Movie',
        movieDes: 'Hacked',
        yearOfPublished: 2024,
      });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not your movie');
  });

  it('should delete a movie by creator', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/movies/${movieId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Movie deleted');
  });

  it('should not delete a movie by another user', async () => {
    // Create a new movie as user1
    const createRes = await request(app.getHttpServer())
      .post('/movies')
      .set('Authorization', `Bearer ${token}`)
      .send({
        movieName: 'Another Movie',
        movieDes: 'Another',
        yearOfPublished: 2022,
      });
    const anotherMovieId = createRes.body.movie.id;
    // Signup/signin as another user
    const email = `otheruser2${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/users/signup')
      .send({ name: 'Other User2', email, password: 'Password1!' })
      .expect(201);
    const signinRes = await request(app.getHttpServer())
      .post('/users/signin')
      .send({ email, password: 'Password1!' });
    const otherToken = signinRes.body.token;
    const res = await request(app.getHttpServer())
      .delete(`/movies/${anotherMovieId}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Not your movie');
  });
});