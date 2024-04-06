import { Module } from '@nestjs/common';
import { QrCodeController } from './qr-code.controller';
import { QrCodeService } from './qr-code.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from './qr-code.enitity';
import { Url } from 'src/url/url.enttity';
import { UrlService } from 'src/url/url.service';

@Module({
  controllers: [QrCodeController],
  providers: [QrCodeService, UrlService],
  imports: [TypeOrmModule.forFeature([QrCode, Url])]
})
export class QrCodeModule {}
