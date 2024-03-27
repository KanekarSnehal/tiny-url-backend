import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipePipe } from 'src/zod-validation-pipe/zod-validation-pipe.pipe';
import { CreateUrlDto, createUrlSchema } from './url.schema';
import { UrlService } from './url.service';

@Controller('url')
export class UrlController {
    constructor(private urlService: UrlService) { }

    @Post()
    @UsePipes(new ZodValidationPipePipe(createUrlSchema))
    createTinyUrl(@Body() createUrlDto: CreateUrlDto) {
        const { long_url, custom_back_half, generate_qr, title } = createUrlDto;

        this.urlService.updateUrl({...createUrlDto, id: 1, created_by: 1 });
    }
}
