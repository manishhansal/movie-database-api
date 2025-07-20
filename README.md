<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Movie Database API

A production-ready RESTful API for a Movie Database, built with [NestJS](https://nestjs.com/), [Sequelize](https://sequelize.org/), and PostgreSQL.

## Features

- User registration and authentication (JWT)
- Movies CRUD (Create, Read, Update, Delete)
  - Only the creator can update/delete their movies
  - All users can view all movies
  - Search and pagination for movies list
  - Unique movie names enforced
- Production-level Swagger API documentation
- Environment variable configuration
- Sequelize migrations
- E2E and integration tests

## Getting Started

### 1. Clone and Install
```bash
$ git clone <repo-url>
$ cd movie-database-api
$ npm install
```

### 2. Environment Variables
Create a `.env` file in the project root:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name
JWT_SECRET=your_jwt_secret
```

### 3. Database Setup & Migrations
Make sure your Postgres database is running and accessible.
Run migrations:
```bash
$ npx sequelize-cli db:migrate
```

### 4. Run the App
```bash
# development
$ npm run start
# watch mode
yarn start:dev
# production
$ npm run start:prod
```

### 5. API Documentation (Swagger)
Visit [http://localhost:9000/api-docs](http://localhost:9000/api-docs) for full interactive API docs.

---

## API Overview

### Authentication
- All movie endpoints require a JWT token in the `Authorization: Bearer <token>` header.
- Obtain a token via `/users/signin` after registering with `/users/signup`.

### User Endpoints
- `POST /users/signup` — Register a new user
- `POST /users/signin` — Login and get JWT token
- `GET /users/me` — Get current user info (requires JWT)

### Movies Endpoints
- `POST /movies` — Create a movie (requires JWT)
- `GET /movies` — List all movies (search & pagination supported, requires JWT)
- `GET /movies/:id` — Get a movie by ID (requires JWT)
- `PUT /movies/:id` — Update a movie (only by creator, requires JWT)
- `DELETE /movies/:id` — Delete a movie (only by creator, requires JWT)

#### Movies List Query Parameters
- `search` — Search by movie name (partial, case-insensitive) or year (exact)
- `page` — Page number (default: 1)
- `limit` — Page size (default: 8)

#### Example: Get movies with search and pagination
```
GET /movies?search=Inception&page=1&limit=5
Authorization: Bearer <token>
```

---

## Migrations
- All schema changes are managed via Sequelize migrations.
- To apply migrations:
```bash
npx sequelize-cli db:migrate
```

---

## Testing
- Run all tests:
```bash
npm run test
```
- E2E and integration tests are included for user and movie flows.

---

## Project Structure
```
movie-database-api/
├── src/
│   ├── models/           # Sequelize models (User, Movie)
│   ├── user/             # User controller and logic
│   ├── movies/           # Movies controller and logic
│   ├── app.module.ts     # Main NestJS module
│   └── main.ts           # App entry point
├── migrations/           # Sequelize migrations
├── test/                 # E2E test setup
├── package.json
├── README.md
└── ...
```

---

## API Documentation Example
See `/api-docs` for full request/response schemas and try out endpoints interactively.

---

## License
MIT
