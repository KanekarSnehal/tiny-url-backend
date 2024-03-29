import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './url.enttity';
import { Repository } from 'typeorm';
import { CreateUrlServiceDto } from './url.schema';

@Injectable()
export class UrlService {
    constructor(
        @InjectRepository(Url)
        private urlRepository: Repository<Url>
    ) { }

    getListOfTinyUrlByUserId(userId) {
        return this.urlRepository.findBy({
            created_by: userId
        });
    }

    createTinyUrl(createUrlData: CreateUrlServiceDto) {
        return this.urlRepository.save(createUrlData);
    }
}
