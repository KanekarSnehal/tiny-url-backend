import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url.enttity';
import { UrlService } from './url.service';
import { ConfigService } from '@nestjs/config';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { QrCode } from 'src/qr-code/qr-code.enitity';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { Analytics } from 'src/analytics/analytics.entity';

@Module({
  controllers: [UrlController],
  imports: [TypeOrmModule.forFeature([Url, QrCode, Analytics])],
  providers: [UrlService, ConfigService, QrCodeService, AnalyticsService]
})
export class UrlModule {}
