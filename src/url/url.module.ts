import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url.enttity';
import { UrlService } from './url.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [UrlController],
  imports: [TypeOrmModule.forFeature([Url])],
  providers: [UrlService, ConfigService]
})
export class UrlModule {}
