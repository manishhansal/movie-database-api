import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UserController {
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for user name or email',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users returned successfully.',
  })
  getUsers(@Query('search') search?: string) {
    // Example logic: fetch users, optionally filter by search
    return [
      {
        id: 'uuid-1',
        name: 'John Doe',
        email: 'john@example.com',
        profilePic: 'https://example.com/john.jpg',
      },
    ];
  }
}
