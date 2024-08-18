import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlModule } from './url/url.module';
import { UserModule } from './user/user.module';
import { Url } from './url/url.enttity';
import { User } from './user/user.entity';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { QrCodeModule } from './qr-code/qr-code.module';
import { QrCode } from './qr-code/qr-code.enitity';
import { AnalyticsModule } from './analytics/analytics.module';
import { Analytics } from './analytics/analytics.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env.development', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, CacheModule.register()],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        entities: [Url, User, QrCode, Analytics],
        synchronize: true,
        logging: true,
        logger: 'advanced-console',
      }),
      inject: [ConfigService]
    }),
    UrlModule,
    UserModule,
    AuthModule,
    QrCodeModule,
    AnalyticsModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
export class AppModule { }
