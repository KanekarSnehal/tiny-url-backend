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
import { getAnalyticsData } from 'src/utils/getAnalyticsData';
import fetch from 'node-fetch';
import { GenericResponse, EngagementOverTime, LocationData, DeviceData } from 'src/utils/genericSchema';

interface AuthenticatedRequest extends Request {
    user: Partial<User>;
}


@Controller('url')
export class UrlController {
    constructor(private urlService: UrlService, private configService: ConfigService, private qrCodeService: QrCodeService, private analyticsService: AnalyticsService) { }

    /**
     * Retrieves a list of TinyURLs created by the authenticated user.
     *
     * @param {Request & { user: Partial<User> }} req - The request object containing the authenticated user information.
     * @returns {Promise<GenericResponse<Url[]>>} An object containing the status and the list of TinyURLs.
     * @throws {BadRequestException} If an error occurs while retrieving the TinyURLs.
     */
    @Get()
    async getListOfTinyUrlByUserId(@Req() req: AuthenticatedRequest): Promise<GenericResponse<Url[]>> {
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

    /**
     * Retrieves details of a TinyURL by its ID, including QR code and analytics data.
     *
     * @param {string} id - The ID of the TinyURL.
     * @throws {BadRequestException} If an error occurs while retrieving the TinyURL details.
     */
    @Get('/:id/details')
    async getDetailsOfTinyUrlByUrlId(@Param('id') id: string): Promise<GenericResponse<Partial<Url> & 
    { qr_code?: string; engagement_over_time?: EngagementOverTime[]; locations?: LocationData[]; device_data?: DeviceData[]; }>> {
        try {
            const response: Partial<Url> = await this.urlService.getDetailsOfTinyUrlByUrlId(id);

            const qrCode = await this.qrCodeService.getQrCodeByUrlId(id);

            const analytics = await this.analyticsService.getAnalyticsDataByTinyUrlId(id);

            const { engagementOverTime, locations, deviceData } = getAnalyticsData(analytics);

            return {
                status: 'success',
                data: {
                    ...response,
                    qr_code: qrCode.content,
                    engagement_over_time: engagementOverTime,
                    locations,
                    device_data: deviceData
                }
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    /**
     * Redirects to the long URL associated with a TinyURL ID and records analytics data.
     *
     * @param {Object} params - The route parameters containing the TinyURL ID.
     * @param {string} redirect - The query parameter to determine if the redirection is for a QR code.
     * @param {Response} res - The response object.
     * @param {string} ipAddress - The IP address of the request.
     * @param {Request} req - The request object containing headers and other information.
     * @returns {Promise<void>}
     * @throws {BadRequestException} If an error occurs during the redirection.
     */
    @Get(':id')
    @AllowUnauthorizedRequest()
    async redirectTinyUrlByUrlId(@Param() params: { id: string }, @Query('r') redirect: string, @Res() res: Response, @Ip() ipAddress: string, @Req() req: Request): Promise<void> {
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
                url_id: urlResponse.id,
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

    /**
     * Creates a new TinyURL with an optional custom back-half and QR code generation.
     *
     * @param {CreateUrlDto} createUrlDto - The data transfer object containing the details to create a TinyURL.
     * @param {string} ipAddress - The IP address of the request.
     * @param {Request & { user: Partial<User> }} req - The request object containing user information.
     * @returns {Promise<GenericResponse>}
     * @throws {BadRequestException} If an error occurs while creating the TinyURL.
     */
    @Post()
    @UsePipes(new ZodValidationPipe(createUrlPayloadSchema))
    async createTinyUrl(@Body() createUrlDto: CreateUrlDto, @Ip() ipAddress: string, @Req() req: Request & { user: Partial<User> }): Promise<GenericResponse> {
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
                // generate qr code
                await this.qrCodeService.createQrCode({ url_id: hash, content: qrCode, created_by: userId });
            }

            // store in db
            return {
                status: 'success',
                message: 'Tiny url created successfully'
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

     /**
     * Updates the details of an existing TinyURL by its ID.
     *
     * @param {Object} params - The route parameters containing the TinyURL ID.
     * @param {UpdateUrlPayloadDto} updateUrlDto - The data transfer object containing the updated details.
     * @returns {Promise<GenericResponse>}
     * @throws {BadRequestException} If an error occurs while updating the TinyURL details.
     */
    @Put(':id')
    @UsePipes(new ZodValidationPipe(updateUrlZObject))
    async updateTinyUrlDetails(@Param() params: { id: string }, @Body() updateUrlDto: UpdateUrlPayloadDto): Promise<GenericResponse> {
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

     /**
     * Deletes a TinyURL by its ID.
     *
     * @param {string} id - The ID of the TinyURL to delete.
     * @returns {Promise<GenericResponse>}
     * @throws {BadRequestException} If an error occurs while deleting the TinyURL.
     */
    @Delete(':id')
    async deleteTinyUrlByUrlId(@Param('id') id: string): Promise<GenericResponse> {
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
