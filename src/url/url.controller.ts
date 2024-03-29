import { Body, Controller, Ip, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipePipe } from 'src/zod-validation-pipe/zod-validation-pipe.pipe';
import { CreateUrlDto, createUrlPayloadSchema } from './url.schema';
import { UrlService } from './url.service';
import { generateUniqueHash } from '../utils/generateUniqueHash';
import { ConfigService } from '@nestjs/config';
const QRCode = require('qrcode');

@Controller('url')
export class UrlController {
    constructor(private urlService: UrlService, private configService: ConfigService) { }

    @Post()
    @UsePipes(new ZodValidationPipePipe(createUrlPayloadSchema))
    async createTinyUrl(@Body() createUrlDto: CreateUrlDto, @Ip() ipAddress: string) {
        const { generate_qr } = createUrlDto;
        const userId = 1;
        let qrCode = null;

        // generate hash
        const hash = generateUniqueHash(ipAddress);

        // generate short url
        const shortUrl = `${this.configService.get('BACKEND_URL')}/${hash}`

        // generate qr if generate_qr is true
        if(generate_qr) {
            try {
                qrCode = await QRCode.toDataURL(shortUrl, {  type: 'image/jpeg' });
              } catch (err) {
                console.error(err)
                throw err;
              }
        }

        // store in db
        this.urlService.crreateTinyUrl({ ...createUrlDto, id: hash, created_by: userId, qr_code: qrCode });
    }
}
