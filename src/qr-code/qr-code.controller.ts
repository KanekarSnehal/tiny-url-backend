import { BadRequestException, Controller, Get } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { UrlService } from 'src/url/url.service';

@Controller('qr-code')
export class QrCodeController {
    constructor(private qrCodeService: QrCodeService, private urlService: UrlService) {}

    @Get()
    async getListOfQrCodeByUserId() {
        try {
            const userId = 1;
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
}
