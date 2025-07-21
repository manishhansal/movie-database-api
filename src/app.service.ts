import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Welcome to the Movie Database API',
      docs: '/api-docs',
      endpoints: [
        {
          method: 'POST',
          path: '/users/signup',
          description: 'Register a new user',
        },
        {
          method: 'POST',
          path: '/users/signin',
          description: 'Sign in and get JWT token',
        },
        {
          method: 'GET',
          path: '/users/me',
          description: 'Get current user info (requires JWT)',
        },
        {
          method: 'POST',
          path: '/movies',
          description: 'Create a movie (requires JWT)',
        },
        {
          method: 'GET',
          path: '/movies',
          description: 'List all movies (search & pagination, requires JWT)',
        },
        {
          method: 'GET',
          path: '/movies/:id',
          description: 'Get a movie by ID (requires JWT)',
        },
        {
          method: 'PUT',
          path: '/movies/:id',
          description: 'Update a movie (only by creator, requires JWT)',
        },
        {
          method: 'DELETE',
          path: '/movies/:id',
          description: 'Delete a movie (only by creator, requires JWT)',
        },
      ],
    };
  }
}
