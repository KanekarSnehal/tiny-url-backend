import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url.enttity';
import { UrlService } from './url.service';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { QrCode } from 'src/qr-code/qr-code.enitity';

@Module({
  controllers: [UrlController],
  imports: [TypeOrmModule.forFeature([Url, QrCode])],
  providers: [UrlService, ConfigService, QrCodeService]
})
export class UrlModule {}
