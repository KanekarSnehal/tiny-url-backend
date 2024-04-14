import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Ip, Param, Post, Put, Query, Req, Res, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod-validation-pipe/zod-validation-pipe.pipe';
import { CreateUrlDto, UpdateUrlPayloadDto, createUrlPayloadSchema, updateUrlZObject } from './url.schema';
import { UrlService } from './url.service';
import { generateUniqueHash } from '../utils/generateUniqueHash';
import { ConfigService } from '@nestjs/config';
import { Url } from './url.enttity';
const QRCode = require('qrcode');
import { Response } from 'express';
import { AllowUnauthorizedRequest } from 'src/utils/allowUnauthorizedRequest';
import { QrCodeService } from 'src/qr-code/qr-code.service';
import { Request } from 'express';
import DeviceDetector = require("device-detector-js");
import { AnalyticsService } from 'src/analytics/analytics.service';
import { User } from 'src/user/user.entity';

@Controller('url')
export class UrlController {
    constructor(private urlService: UrlService, private configService: ConfigService, private qrCodeService: QrCodeService, private analyticsService: AnalyticsService) { }

    @Get()
    async getListOfTinyUrlByUserId(@Req() req: Request & { user: Partial<User> }) {
        try {
            const userId = req.user.id;
            const response = await this.urlService.getListOfTinyUrlByUserId(userId);
            return {
                status: 'success',
                data: response
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get('/:id/details')
    async getDetailsOfTinyUrlByUrlId(@Param('id') id: string) {
        try {
            const response: Url & { qr_code?: string } = await this.urlService.getDetailsOfTinyUrlByUrlId(id);

            const qrCode = await this.qrCodeService.getQrCodeByUrlId(id);

            if (qrCode && qrCode.content) {
                response.qr_code = qrCode.content;
            }

            const analytics = await this.analyticsService.getAnalyticsDataByTinyUrlId(id);

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
                    ...response,
                    engagement_over_time: engagementOverTime,
                    locations,
                    device_data: deviceData
                }
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id')
    @AllowUnauthorizedRequest()
    async redirectTinyUrlByUrlId(@Param() params: { id: string }, @Query('r') redirect: string, @Res() res: Response, @Ip() ipAddress: string, @Req() req: Request) {
        try {
            const urlId = params.id;

            const urlResponse: Partial<Url> = await this.urlService.getDetailsOfTinyUrlByUrlId(urlId);

            // if redirect is qr then get qr code details
            const qrCode = redirect == 'qr' ? await this.qrCodeService.getQrCodeByUrlId(urlId) : null;
            
            // get device details
            const userAgent = req.headers['user-agent'];
            const deviceDetector = new DeviceDetector();
            const deviceDetails = deviceDetector.parse(userAgent);
            const { os, client, device } = deviceDetails;
            
            // get country and city details
            const geoPlugin = await fetch(`http://www.geoplugin.net/json.gp?ip=${ipAddress}`);
            const geoPluginResponse = await geoPlugin.json();
            const { geoplugin_countryName: country, geoplugin_city: city } = geoPluginResponse;

            const analyticsData = {
                analytical_type: redirect == 'qr' ? 'qr' : 'url',
                url_id: urlId,
                qr_code_id: redirect == 'qr' ? qrCode.id : null,
                country,
                city,
                device_type: device.type,
                browser: client.name,
                os: os.name
            };

            // store analytics data
            await this.analyticsService.createAnalyticsData(analyticsData);
            
            if (urlResponse && urlResponse.long_url) {
                return res.redirect(HttpStatus.MOVED_PERMANENTLY, urlResponse.long_url);
            }

            res.status(HttpStatus.NOT_FOUND).sendFile('urlNotFound.html', { root: './src/static' });

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createUrlPayloadSchema))
    async createTinyUrl(@Body() createUrlDto: CreateUrlDto, @Ip() ipAddress: string, @Req() req: Request & { user: Partial<User> }) {
        try {
            const { generate_qr, custom_back_half } = createUrlDto;
            const userId = req.user.id;
            let qrCode = null;

            // check if custom_back_half is already present either as custom_back_half or hash
            const isCustomBackHalfExist = custom_back_half ? await this.urlService.isCustomBackHalfExist(custom_back_half) : false;

            if (isCustomBackHalfExist) {
                throw Error('Custom back half already exist');
            }

            // generate hash
            const hash = generateUniqueHash(ipAddress);

            // generate short url
            const shortUrl = `${this.configService.get('BACKEND_URL')}/${custom_back_half ? custom_back_half : hash}?r=qr`

            // create tiny url
            await this.urlService.createTinyUrl({ ...createUrlDto, id: hash, created_by: userId });

            // generate qr if generate_qr is true
            if (generate_qr) {
                qrCode = await QRCode.toDataURL(shortUrl, { type: 'image/jpeg' });
            }

            // generate qr code
            await this.qrCodeService.createQrCode({ url_id: hash, content: qrCode, created_by: userId });
            

            // store in db
            return {
                status: 'success',
                message: 'Tiny url created successfully'
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Put(':id')
    @UsePipes(new ZodValidationPipe(updateUrlZObject))
    async updateTinyUrlDetails(@Param() params: { id: string }, @Body() updateUrlDto: UpdateUrlPayloadDto) {
        try {
            const urlId = params.id;
            const { custom_back_half, title } = updateUrlDto;
            await this.urlService.updateTinyUrlDetails(urlId, { custom_back_half, title });
            
            const isQrCodeExist = await this.qrCodeService.getQrCodeByUrlId(urlId);

            if (isQrCodeExist && isQrCodeExist.content) {
                const shortUrl = `${this.configService.get('BACKEND_URL')}/${custom_back_half ? custom_back_half : urlId}?r=qr`;
                const qrCode = await QRCode.toDataURL(shortUrl, { type: 'image/jpeg' });
                await this.qrCodeService.updateQrCodeDetails(isQrCodeExist.id, { content: qrCode });
            }
            return {
                status: 'success',
                message: 'Tiny url details updated successfully'
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Delete(':id')
    async deleteTinyUrlByUrlId(@Param('id') id: string) {
        try {
            await this.urlService.deleteTinyUrlByUrlId(id);
            return {
                status: 'success',
                message: 'Tiny url deleted successfully'
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
