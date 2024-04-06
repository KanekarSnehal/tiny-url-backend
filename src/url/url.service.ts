import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './url.enttity';
import { Repository } from 'typeorm';
import { CreateUrlServiceDto, UpdateUrlDto } from './url.schema';

@Injectable()
export class UrlService {
    constructor(
        @InjectRepository(Url)
        private urlRepository: Repository<Url>
    ) { }

    getListOfTinyUrlByUserId(userId: number) {
        return this.urlRepository.find({
            where: {
                created_by: userId
            },
            order: {
                created_at: 'DESC'
            }
        });
    }

    getDetailsOfTinyUrlByUrlId(urlId: string) {
        return this.urlRepository.findOne({
            where: [
                { id: urlId },
                { custom_back_half: urlId }
            ],
            select: ['id', 'long_url', 'qr_code']
        });
    }

    createTinyUrl(createUrlData: CreateUrlServiceDto) {
        return this.urlRepository.save(createUrlData);
    }

    updateTinyUrlDetails(id: string, updateUrlData: UpdateUrlDto) {
        return this.urlRepository.update(id, updateUrlData);
    }

    deleteTinyUrlByUrlId(urlId: string) {
        return this.urlRepository.delete(urlId);
    }

    isCustomBackHalfExist(customBackHalf: string) {
        return this.urlRepository.findOne({
            where: [
                { custom_back_half: customBackHalf },
                { id: customBackHalf }
            ]
        });
    }
}
