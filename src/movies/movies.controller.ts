/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
  UnauthorizedException,
  NotFoundException,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Movie } from '../models/movie.model';
import { IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';
import { GetUser } from '../user/user.controller';
import { Op } from 'sequelize';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

class CreateMovieDto {
  @IsNotEmpty()
  movieName!: string;
  @IsOptional()
  movieDes!: string;
  @IsInt()
  @Min(1800)
  yearOfPublished!: number;
  @IsOptional()
  moviePoster?: string;
}

@ApiTags('movies')
@ApiBearerAuth()
@Controller('movies')
export class MoviesController {
  @Post()
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        movieName: { type: 'string', example: 'Inception' },
        movieDes: { type: 'string', example: 'A mind-bending thriller.' },
        yearOfPublished: { type: 'integer', example: 2010 },
        moviePoster: { type: 'string', example: 'https://example.com/poster.jpg' },
      },
      required: ['movieName', 'yearOfPublished'],
    },
  })
  @ApiResponse({ status: 201, description: 'Movie created successfully', schema: { example: { movie: { id: 'uuid', movieName: 'Inception', movieDes: 'A mind-bending thriller.', yearOfPublished: 2010, moviePoster: 'https://example.com/poster.jpg', userId: 'uuid', createdAt: 'date', updatedAt: 'date' } } } })
  @ApiResponse({ status: 400, description: 'Validation or uniqueness error' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() dto: CreateMovieDto, @GetUser() user: { id: string }) {
    try {
      const movie = await Movie.create({ ...dto, userId: user.id } as any);
      return { movie };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name: string }).name === 'SequelizeUniqueConstraintError' &&
        'errors' in error &&
        Array.isArray((error as any).errors)
      ) {
        const errAny = error as any;
        if (errAny.errors[0] && 'message' in errAny.errors[0]) {
          throw new BadRequestException(errAny.errors[0].message);
        }
      }
      if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new BadRequestException((error as { message: string }).message);
      }
      throw new BadRequestException('Failed to create movie');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all movies (with search and pagination)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by movie name or year' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Page size', example: 8 })
  @ApiResponse({ status: 200, description: 'List of movies', schema: { example: { movies: [{ id: 'uuid', movieName: 'Inception', movieDes: 'A mind-bending thriller.', yearOfPublished: 2010, moviePoster: 'https://example.com/poster.jpg', userId: 'uuid', createdAt: 'date', updatedAt: 'date' }], total: 1, page: 1, limit: 8, totalPages: 1 } } })
  async getAll(
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '8',
  ) {
    const where: Record<string, any> = {};
    if (search) {
      const searchNum = Number(search);
      if (!isNaN(searchNum)) {
        (where as any)[Op.or] = [
          { movieName: { [Op.iLike]: `%${search}%` } },
          { yearOfPublished: searchNum },
        ];
      } else {
        where.movieName = { [Op.iLike]: `%${search}%` };
      }
    }
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 8;
    const offset = (pageNum - 1) * limitNum;
    const { rows: movies, count } = await Movie.findAndCountAll({
      where,
      offset,
      limit: limitNum,
      order: [['createdAt', 'DESC']],
    });
    return {
      movies,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a movie by ID' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({ status: 200, description: 'Movie found', schema: { example: { movie: { id: 'uuid', movieName: 'Inception', movieDes: 'A mind-bending thriller.', yearOfPublished: 2010, moviePoster: 'https://example.com/poster.jpg', userId: 'uuid', createdAt: 'date', updatedAt: 'date' } } } })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async getOne(@Param('id') id: string) {
    const movie = await Movie.findByPk(id);
    if (!movie) throw new NotFoundException('Movie not found') as Error;
    return { movie };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a movie (only by creator)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        movieName: { type: 'string', example: 'Inception' },
        movieDes: { type: 'string', example: 'A mind-bending thriller.' },
        yearOfPublished: { type: 'integer', example: 2010 },
        moviePoster: { type: 'string', example: 'https://example.com/poster.jpg' },
      },
      required: ['movieName', 'yearOfPublished'],
    },
  })
  @ApiResponse({ status: 200, description: 'Movie updated', schema: { example: { movie: { id: 'uuid', movieName: 'Inception', movieDes: 'A mind-bending thriller.', yearOfPublished: 2010, moviePoster: 'https://example.com/poster.jpg', userId: 'uuid', createdAt: 'date', updatedAt: 'date' } } } })
  @ApiResponse({ status: 401, description: 'Not your movie' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async update(@Param('id') id: string, @Body() dto: CreateMovieDto, @GetUser() user: { id: string }) {
    const movie = await Movie.findByPk(id);
    if (!movie) throw new NotFoundException('Movie not found');
    const movieData = movie.get({ plain: true });
    if (movieData.userId !== user.id) throw new UnauthorizedException('Not your movie') as Error;
    await movie.update(dto);
    return { movie };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a movie (only by creator)' })
  @ApiParam({ name: 'id', description: 'Movie ID' })
  @ApiResponse({ status: 200, description: 'Movie deleted', schema: { example: { message: 'Movie deleted' } } })
  @ApiResponse({ status: 401, description: 'Not your movie' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async delete(@Param('id') id: string, @GetUser() user: { id: string }) {
    const movie = await Movie.findByPk(id);
    if (!movie) throw new NotFoundException('Movie not found');
    const movieData = movie.get({ plain: true });
    if (movieData.userId !== user.id) throw new UnauthorizedException('Not your movie') as Error;
    await movie.destroy();
    return { message: 'Movie deleted' };
  }
}
