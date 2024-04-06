import { BadRequestException, Body, Controller, Delete, Get, HttpStatus, Ip, Param, Post, Put, Res, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod-validation-pipe/zod-validation-pipe.pipe';
import { CreateUrlDto, UpdateUrlPayloadDto, createUrlPayloadSchema, updateUrlPayloadSchema } from './url.schema';
import { UrlService } from './url.service';
import { generateUniqueHash } from '../utils/generateUniqueHash';
import { ConfigService } from '@nestjs/config';
import { Url } from './url.enttity';
const QRCode = require('qrcode');
import { Response } from 'express';
import { AllowUnauthorizedRequest } from 'src/utils/allowUnauthorizedRequest';

@Controller('url')
export class UrlController {
    constructor(private urlService: UrlService, private configService: ConfigService) { }

    @Get()
    async getListOfTinyUrlByUserId() {
        try {
            const userId = 1;
            const response = await this.urlService.getListOfTinyUrlByUserId(userId);
            return {
                status: 'success',
                data: response
            }
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id')
    @AllowUnauthorizedRequest()
    async getDetailsOfTinyUrlByUrlId(@Param() params: { id: string }, @Res() res: Response) {
        try {
            const urlId = params.id;
            const response: Partial<Url> = await this.urlService.getDetailsOfTinyUrlByUrlId(urlId);
            if (response && response.long_url) {
                return res.redirect(HttpStatus.MOVED_PERMANENTLY, response.long_url);
            }
            res.status(HttpStatus.NOT_FOUND).sendFile('urlNotFound.html', { root: './src/static' });

        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createUrlPayloadSchema))
    async createTinyUrl(@Body() createUrlDto: CreateUrlDto, @Ip() ipAddress: string) {
        try {
            const { generate_qr, custom_back_half } = createUrlDto;
            const userId = 1;
            let qrCode = null;

            // check if custom_back_half is already present either as custom_back_half or hash
            const isCustomBackHalfExist = custom_back_half ? await this.urlService.isCustomBackHalfExist(custom_back_half) : false;

            if (isCustomBackHalfExist) {
                throw Error('Custom back half already exist');
            }

            // generate hash
            const hash = generateUniqueHash(ipAddress);

            // generate short url
            const shortUrl = `${this.configService.get('BACKEND_URL')}/${custom_back_half ? custom_back_half : hash}`

            // generate qr if generate_qr is true
            if (generate_qr) {
                qrCode = await QRCode.toDataURL(shortUrl, { type: 'image/jpeg' });
            }

            // store in db
            await this.urlService.createTinyUrl({ ...createUrlDto, id: hash, created_by: userId, qr_code: qrCode });
            return {
                status: 'success',
                message: 'Tiny url created successfully'
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Put()
    @UsePipes(new ZodValidationPipe(updateUrlPayloadSchema))
    async updateTinyUrlDetails(@Body() updateUrlDto: UpdateUrlPayloadDto) {
        try {
            const { id, custom_back_half, title } = updateUrlDto;
            await this.urlService.updateTinyUrlDetails(id, { custom_back_half, title });
            
            const isQrCodeExist = await this.urlService.getDetailsOfTinyUrlByUrlId(custom_back_half ? custom_back_half : id);

            if (isQrCodeExist && isQrCodeExist.qr_code) {
                const shortUrl = `${this.configService.get('BACKEND_URL')}/${custom_back_half ? custom_back_half : id}`;
                const qrCode = await QRCode.toDataURL(shortUrl, { type: 'image/jpeg' });
                await this.urlService.updateTinyUrlDetails(id, { qr_code: qrCode });
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
