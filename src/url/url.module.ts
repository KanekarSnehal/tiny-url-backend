import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url.enttity';
import { UrlService } from './url.service';

@Module({
  controllers: [UrlController],
  imports: [TypeOrmModule.forFeature([Url])],
  providers: [UrlService]
})
export class UrlModule {}
