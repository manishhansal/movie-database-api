/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, Query, Body, Post, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { UsePipes, ValidationPipe } from '@nestjs/common';

class CreateUserDto {
  @IsNotEmpty({ message: 'name should not be empty' })
  name!: string;
  @IsEmail()
  email!: string;
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,}$/, {
    message:
      'Password must be at least 6 characters long, contain one uppercase letter, one number, and one special character.',
  })
  password!: string;
  @IsOptional()
  profilePic?: string;
}

@ApiTags('users')
@Controller('users')
export class UserController {
  @Post('signup')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signup(@Body() createUserDto: CreateUserDto) {
    try {
      const { name, email, password, profilePic } = createUserDto;
      // Hash the password
      const hashedPassword: string = await bcrypt.hash(password, 10);
      // Create the user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        profilePic: profilePic ?? '',
      } as any);
      // Return user data without password
      const userData = user.get({ plain: true });
      delete (userData as unknown as Record<string, unknown>)['password'];
      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'secret';
      const token = jwt.sign(
        {
          id: userData.id,
          email: userData.email,
        },
        jwtSecret,
        {
          expiresIn: '1h',
        },
      );
      return { user: userData, token };
    } catch(error: any) {
      console.error(error);
      throw new InternalServerErrorException('Signup failed');
    }
    
  }

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
  getUsers(@Query('search') _search?: string) {
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
