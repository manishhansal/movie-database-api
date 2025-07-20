import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { UserController } from './user/user.controller';
import { MoviesController } from './movies/movies.controller';
import { Movie } from './models/movie.model';

@Module({
  imports: [
    // 1. Load the environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 2. Configure Sequelize dynamically using the loaded variables
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadModels: true,
        synchronize: true,
        models: [User, Movie],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController, UserController, MoviesController],
  providers: [AppService],
})
export class AppModule {}
