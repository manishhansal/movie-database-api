/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Controller, Get, Query, Body, Post, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

function extractTokenFromHeader(req: Request): string | null {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}

export const GetUser = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const token = extractTokenFromHeader(req);
  if (!token) throw new UnauthorizedException('No token provided');
  try {
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const payload = jwt.verify(token, jwtSecret) as any;
    return payload;
  } catch {
    throw new UnauthorizedException('Invalid token');
  }
});

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

class SignInDto {
  @IsEmail()
  email!: string;
  @IsNotEmpty({ message: 'password should not be empty' })
  password!: string;
}

@ApiTags('users')
@Controller('users')
export class UserController {
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'Password1!' },
        profilePic: { type: 'string', example: 'https://example.com/john.jpg' },
      },
      required: ['name', 'email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully', schema: { example: { user: { id: 'uuid', name: 'John Doe', email: 'john@example.com', profilePic: 'https://example.com/john.jpg', createdAt: 'date', updatedAt: 'date' } } } })
  @ApiResponse({ status: 400, description: 'Validation or registration error' })
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
      return { user: userData };
    } catch(error: any) {
      throw new InternalServerErrorException('Signup failed', error);
    }
    
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'Password1!' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'User signed in successfully', schema: { example: { user: { id: 'uuid', name: 'John Doe', email: 'john@example.com', profilePic: 'https://example.com/john.jpg', createdAt: 'date', updatedAt: 'date' }, token: 'jwt.token.here' } } })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signin(@Body() signinDto: SignInDto) {

    const { email, password } = signinDto;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const userData = user.get({ plain: true });
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    delete (userData as unknown as Record<string, unknown>)['password'];
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
  }

  @Get('me')
  @ApiOperation({ summary: 'Get logged-in user details' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User details', schema: { example: { user: { id: 'uuid', name: 'John Doe', email: 'john@example.com', profilePic: 'https://example.com/john.jpg', createdAt: 'date', updatedAt: 'date' } } } })
  @ApiResponse({ status: 401, description: 'Unauthorized or invalid token' })
  async getMe(@GetUser() userPayload: { id: string }) {
    try {
      const user = await User.findByPk(userPayload.id, {
        attributes: [
          "id",
          "name",
          "email",
          "profilePic",
        ]
      });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      const userData = user.get({ plain: true });
      return { user: userData };
    } catch (error) {
      throw new InternalServerErrorException('Something went wrong', error);
    }
  }
}
