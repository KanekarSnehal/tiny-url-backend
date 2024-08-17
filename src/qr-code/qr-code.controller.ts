import { BadRequestException, Controller, ExecutionContext, Get, Param, Req } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { UrlService } from 'src/url/url.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { Request } from 'express';
import { User } from 'src/user/user.entity';
import { getAnalyticsData } from 'src/utils/getAnalyticsData';
import { DeviceData, EngagementOverTime, GenericResponse, LocationData } from 'src/utils/genericSchema';
import { Url } from '../url/url.enttity';
import { QrCode } from './qr-code.enitity';

@Controller('qr-code')
export class QrCodeController {
    constructor(private qrCodeService: QrCodeService, private urlService: UrlService, private analyticsService: AnalyticsService) {}

    /**
     * Retrieves a list of QrCodes created by the authenticated user.
     *
     * @param {Request & { user: Partial<User> }} req - The request object containing the authenticated user information.
     * @returns {Promise<GenericResponse<Partial<Url & QrCode>[]>>} An object containing the status and the list of QrCodes.
     * @throws {BadRequestException} If an error occurs while retrieving the QrCodes.
     */
    @Get()
    async getListOfQrCodeByUserId(@Req() req: Request & { user: Partial<User> }): Promise<GenericResponse<Partial<Url & QrCode>[]>> {
        try {
            const userId = req.user.id;
            const qrCodes = await this.qrCodeService.getListOfQrCodeByUserId(userId);

            // get all the urls
            const urls = await this.urlService.getListOfTinyUrlByUserId(userId);

            // map qrCodes with urls
            const response = qrCodes.map(qrCode => {
                const url = urls.find(url => url.id === qrCode.url_id);
                if (url) {
                    return {
                        id: qrCode.id,
                        url_id: qrCode.url_id,
                        long_url: url.long_url,
                        qr_code: qrCode.content,
                        title: url.title,
                        created_at: qrCode.created_at,
                        created_by: qrCode.created_by,
                        custom_back_half: url.custom_back_half
                    }
                }
            });

            return {
                status: 'success',
                data: response
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Retrieves details of a QrCode by its ID, including QR code and analytics data.
     *
     * @param {string} qrCodeId - The ID of the QrCode.
     * @throws {BadRequestException} If an error occurs while retrieving the QrCode details.
     */
    @Get(':id/details')
    async getQrCodeDetailsById(@Param('id') qrCodeId: string): Promise<GenericResponse<Partial<QrCode & Url> & 
    { qr_code?: string, engagement_over_time?: EngagementOverTime[]; locations?: LocationData[]; device_data?: DeviceData[]; }>> {
        try {
            const qrCode = await this.qrCodeService.getQrCodeById(qrCodeId);

            const url = await this.urlService.getDetailsOfTinyUrlByUrlId(qrCode.url_id);

            const analytics = await this.analyticsService.getAnalyticsDataByQrCodeId(qrCodeId);

            const { engagementOverTime, locations, deviceData } = getAnalyticsData(analytics);
            
            return {
                status: 'success',
                data: {
                    id: qrCode.id,
                    url_id: qrCode.url_id,
                    long_url: url.long_url,
                    qr_code: qrCode.content,
                    title: url.title,
                    created_at: qrCode.created_at,
                    created_by: qrCode.created_by,
                    custom_back_half: url.custom_back_half,
                    engagement_over_time: engagementOverTime,
                    locations,
                    device_data: deviceData
                }
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
