import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url.enttity';

@Module({
  controllers: [UrlController],
  imports: [TypeOrmModule.forFeature([Url])]
})
export class UrlModule {}
