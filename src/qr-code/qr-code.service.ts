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

    /**
     * Get List Of QRCodes By User Id
     * @param {number} userId - The ID of the user whose QrCodes are to be fetched.
     * @returns {Promise<QrCode[]>} A promise that resolves to an array of QrCode objects.
     */
    getListOfQrCodeByUserId(userId: number): Promise<QrCode[]> {
        return this.qrCodeRepository.find({
            where: {
                created_by: userId
            },
            order: {
                created_at: 'DESC'
            }
        });
    }

    /**
     * Create QrCode
     * @param {CreateQrCodeServiceDto} createQrCodeData - Data required to create a QrCode.
     * @returns {Promise<QrCode>} A promise that resolves to the created QrCode object.
     */
    createQrCode(createQrCodeData: CreateQrCodeServiceDto): Promise<QrCode> {
        return this.qrCodeRepository.save(createQrCodeData);
    }

    /**
     * Get Qr Code By Url Id
     * @param {string} urlId - The ID of the tiny URL whose QrCodes are to be fetched.
     * @returns {Promise<QrCode | undefined>} A promise that resolves to the QrCode object if found, or undefined if not.
     */
    getQrCodeByUrlId(urlId: string): Promise<QrCode | undefined> {
        return this.qrCodeRepository.findOne({
            where: {
                url_id: urlId
            }
        });
    }

    /**
     * Update QR Code Details
     * @param {string} id - The ID of the QrCode to update.
     * @param {UpdateQrCodeServiceDto} updateQrCodeData - Data to update the QrCode
     * @returns {Promise<void>} A promise that resolves to the result of the update operation.
     */
    updateQrCodeDetails(id: string, updateQrCodeData: UpdateQrCodeServiceDto): Promise<void> {
        this.qrCodeRepository.update(id, updateQrCodeData);
        return;
    }

    /**
     * Get QR Code Details by QrCode Id
     * @param {string} qrCodeId - The ID of the QrCode to delete.
     * @returns {Promise<QrCode>} A promise that resolves to the result of the delete operation.
     */
    getQrCodeById(qrCodeId: string): Promise<QrCode> {
        return this.qrCodeRepository.findOne({
            where: {
                id: qrCodeId
            }
        });
    }
}
