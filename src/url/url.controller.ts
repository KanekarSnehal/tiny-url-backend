import { Body, Controller, Get, Ip, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/zod-validation-pipe/zod-validation-pipe.pipe';
import { CreateUrlDto, createUrlPayloadSchema } from './url.schema';
import { UrlService } from './url.service';
import { generateUniqueHash } from '../utils/generateUniqueHash';
import { ConfigService } from '@nestjs/config';
const QRCode = require('qrcode');

@Controller('url')
export class UrlController {
    constructor(private urlService: UrlService, private configService: ConfigService) { }

    @Get()
    async getListOfTinyUrlByUserId() {
        try {
            const userId = 1;
            return this.urlService.getListOfTinyUrlByUserId(userId);
        } catch(error) {
            throw error;
        }
    }

    @Post()
    @UsePipes(new ZodValidationPipe(createUrlPayloadSchema))
    async createTinyUrl(@Body() createUrlDto: CreateUrlDto, @Ip() ipAddress: string) {
        try {
            const { generate_qr } = createUrlDto;
            const userId = 1;
            let qrCode = null;
    
            // generate hash
            const hash = generateUniqueHash(ipAddress);
    
            // generate short url
            const shortUrl = `${this.configService.get('BACKEND_URL')}/${hash}`
    
            // generate qr if generate_qr is true
            if(generate_qr) {
                qrCode = await QRCode.toDataURL(shortUrl, {  type: 'image/jpeg' });
            }
    
            // store in db
            this.urlService.createTinyUrl({ ...createUrlDto, id: hash, created_by: userId, qr_code: qrCode });
            return {
                status: 'success',
                message: 'Tiny url created successfully'
            };
        } catch(error) {
            throw error;
        }
    }
}
