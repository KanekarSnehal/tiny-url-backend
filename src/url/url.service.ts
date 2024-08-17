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

    /**
     * Retrieves a list of tiny URLs created by a specific user.
     * @param {number} userId - The ID of the user whose tiny URLs are to be fetched.
     * @returns {Promise<Url[]>} A promise that resolves to an array of TinyUrl objects.
     */
    getListOfTinyUrlByUserId(userId: number): Promise<Url[]> {
        return this.urlRepository.find({
            where: {
                created_by: userId
            },
            order: {
                created_at: 'DESC'
            }
        });
    }

    /**
     * Retrieves details of a tiny URL by its ID or custom back half.
     * @param {string} urlId - The ID or custom back half of the tiny URL.
     * @returns {Promise<Partial<Url> | undefined>} A promise that resolves to the TinyUrl object if found, or undefined if not.
     */
    getDetailsOfTinyUrlByUrlId(urlId: string): Promise<Partial<Url> | undefined> {
        return this.urlRepository.findOne({
            where: [
                { id: urlId },
                { custom_back_half: urlId }
            ],
            select: ['id', 'long_url', 'title', 'created_at', 'created_by', 'custom_back_half', 'custom_domain']
        });
    }

    /**
     * Creates a new tiny URL.
     * @param {CreateUrlServiceDto} createUrlData - Data required to create a tiny URL.
     * @returns {Promise<Url>} A promise that resolves to the created TinyUrl object.
     */
    createTinyUrl(createUrlData: CreateUrlServiceDto): Promise<Url> {
        return this.urlRepository.save(createUrlData);
    }

    /**
     * Updates the details of an existing tiny URL.
     * @param {string} id - The ID of the tiny URL to update.
     * @param {UpdateUrlDto} updateUrlData - Data to update the tiny URL.
     * @returns {Promise<void>} A promise that resolves to the result of the update operation.
     */
    updateTinyUrlDetails(id: string, updateUrlData: UpdateUrlDto): Promise<void> {
        this.urlRepository.update(id, updateUrlData);
        return;
    }

    /**
     * Deletes a tiny URL by its ID.
     * @param {string} urlId - The ID of the tiny URL to delete.
     * @returns {Promise<void>} A promise that resolves to the result of the delete operation.
     */
    deleteTinyUrlByUrlId(urlId: string): Promise<void> {
        this.urlRepository.delete(urlId);
        return;
    }

    /**
     * Checks if a custom back half already exists.
     * @param {string} customBackHalf - The custom back half to check.
     * @returns {Promise<Partial<Url> | undefined>} A promise that resolves to the TinyUrl object if the custom back half exists, or undefined if not.
     */
    isCustomBackHalfExist(customBackHalf: string): Promise<Partial<Url> | undefined> {
        return this.urlRepository.findOne({
            where: [
                { custom_back_half: customBackHalf },
                { id: customBackHalf }
            ]
        });
    }
}
