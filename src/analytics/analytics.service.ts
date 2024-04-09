import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from './analytics.entity';
import { AnalyticsDto } from './analytics.schema';

@Injectable()
export class AnalyticsService {
    constructor(@InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>) {}

    createAnalyticsData(analyticsData: AnalyticsDto | AnalyticsDto[]) {
        analyticsData = Array.isArray(analyticsData) ? analyticsData : [analyticsData];
        return this.analyticsRepository.save(analyticsData);
    }

    getAnalyticsDataByTinyUrlId(tinyUrlId: string) {
        return this.analyticsRepository.find({ where: { url_id: tinyUrlId } });
    }
}
