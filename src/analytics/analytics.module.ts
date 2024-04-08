import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from 'src/qr-code/qr-code.enitity';
import { User } from 'src/user/user.entity';
import { AnalyticsService } from './analytics.service';
import { Analytics } from './analytics.entity';

@Module({
    controllers: [],
    providers: [AnalyticsService],
    imports: [TypeOrmModule.forFeature([User, QrCode, Analytics])],
})
export class AnalyticsModule {}
