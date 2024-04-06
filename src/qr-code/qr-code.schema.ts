import { z } from 'zod';

export const createQrCodeZObject = z
    .object({
        url_id: z.string(),
        created_by: z.number(),
        content: z.string()
    }).required();

export type CreateQrCodeServiceDto = z.infer<typeof createQrCodeZObject>;

export const updateQrCodeZObject = z
    .object({
        content: z.string()
    }).required();

export type UpdateQrCodeServiceDto = z.infer<typeof updateQrCodeZObject>;