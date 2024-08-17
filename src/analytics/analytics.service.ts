import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Analytics } from './analytics.entity';
import { AnalyticsDto } from './analytics.schema';

@Injectable()
export class AnalyticsService {
    constructor(@InjectRepository(Analytics)
    private analyticsRepository: Repository<Analytics>) {}

    /**
     * Creates and saves analytics data.
     * @param analyticsData - A single `AnalyticsDto` object or an array of `AnalyticsDto` objects to be saved.
     * @returns {Promise<Analytics | Analytics[]>} A promise that resolves to the result of the save operation, typically containing the saved analytics data.
     */
    createAnalyticsData(analyticsData: AnalyticsDto | AnalyticsDto[]): Promise<Analytics | Analytics[]> {
        analyticsData = Array.isArray(analyticsData) ? analyticsData : [analyticsData];
        return this.analyticsRepository.save(analyticsData);
    }

    /**
     * Retrieves analytics data associated with a specific Tiny URL ID.
     * @param {string} tinyUrlId - The Tiny URL ID to search for.
     * @returns {Promise<Analytics[]>} A promise that resolves to an array of `AnalyticsDto` objects that match the given Tiny URL ID.
     */
    getAnalyticsDataByTinyUrlId(tinyUrlId: string): Promise<Analytics[]> {
        return this.analyticsRepository.find({ where: { url_id: tinyUrlId } });
    }

    /**
     * Retrieves analytics data associated with a specific QR code ID.
     * @param {string} qrCodeId - The QR code ID to search for.
     * @returns {Promise<Analytics[]>} A promise that resolves to an array of `AnalyticsDto` objects that match the given QR code ID.
     */
    getAnalyticsDataByQrCodeId(qrCodeId: string): Promise<Analytics[]> {
        return this.analyticsRepository.find({ where: { qr_code_id: qrCodeId } });
    }
}
