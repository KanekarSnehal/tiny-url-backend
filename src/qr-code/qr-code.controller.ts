import { BadRequestException, Controller, ExecutionContext, Get, Param, Req } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { UrlService } from 'src/url/url.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { Request } from 'express';
import { User } from 'src/user/user.entity';

@Controller('qr-code')
export class QrCodeController {
    constructor(private qrCodeService: QrCodeService, private urlService: UrlService, private analyticsService: AnalyticsService) {}

    @Get()
    async getListOfQrCodeByUserId(@Req() req: Request & { user: Partial<User> }) {
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

    @Get(':id/details')
    async getQrCodeDetailsById(@Param('id') qrCodeId: string) {
        try {
            const qrCode = await this.qrCodeService.getQrCodeById(qrCodeId);

            const url = await this.urlService.getDetailsOfTinyUrlByUrlId(qrCode.url_id);

            const analytics = await this.analyticsService.getAnalyticsDataByQrCodeId(qrCodeId);

            // engagment over time
            const engagementOverTime = analytics.reduce((acc, curr) => {
                const date = new Date(curr.created_at).toDateString();
                const index = acc.findIndex(item => item.date === date);
                if (index !== -1) {
                    acc[index].clicks += 1;
                } else {
                    acc.push({ date, clicks: 1 });
                }
                return acc;
            }, []);

            // locations data
            const locations = analytics.reduce((acc, curr) => {
                const { country, city } = curr;
                const index = acc.findIndex(item => item.country === country && item.city === city);
                if (index !== -1) {
                    acc[index].clicks += 1;
                } else {
                    acc.push({ country, city, clicks: 1 });
                }
                return acc;
            }, []);


            // device data
            const deviceData = analytics.reduce((acc, curr) => {
                const { device_type, browser, os } = curr;
                const index = acc.findIndex(item => item.device_type === device_type && item.browser === browser && item.os === os);
                if (index !== -1) {
                    acc[index].clicks += 1;
                } else {
                    acc.push({ device_type, browser, os, clicks: 1 });
                }
                return acc;
            }, []);

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
