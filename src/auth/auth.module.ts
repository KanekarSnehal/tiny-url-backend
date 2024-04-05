import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService, ConfigService],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [JwtService]

})
export class AuthModule {}
