import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCode } from './qr-code.enitity';
import { CreateQrCodeServiceDto, UpdateQrCodeServiceDto } from './qr-code.schema';

@Injectable()
export class QrCodeService {
    constructor(
        @InjectRepository(QrCode)
        private qrCodeRepository: Repository<QrCode>
    ) { }

    getListOfQrCodeByUserId(userId: number) {
        return this.qrCodeRepository.find({
            where: {
                created_by: userId
            },
            order: {
                created_at: 'DESC'
            }
        });
    }

    createQrCode(createQrCodeData: CreateQrCodeServiceDto) {
        return this.qrCodeRepository.save(createQrCodeData);
    }

    getQrCodeByUrlId(urlId: string) {
        return this.qrCodeRepository.findOne({
            where: {
                url_id: urlId
            }
        });
    }

    updateQrCodeDetails(id: string, updateQrCodeData: UpdateQrCodeServiceDto) {
        return this.qrCodeRepository.update(id, updateQrCodeData);
    }

    getQrCodeById(qrCodeId: string) {
        return this.qrCodeRepository.findOne({
            where: {
                id: qrCodeId
            }
        });
    }
}
