import { z } from 'zod';

export const createUrlZObject = z
  .object({
    long_url: z.string().url({ message: 'Invalid Url'}),
    title: z.string(),
    custom_back_half: z.string(),
    generate_qr: z.coerce.boolean(),
    id: z.string(),
    created_by: z.number(),
    qr_code: z.string()
  }).partial();

export const createUrlPayloadSchema = createUrlZObject.required({ long_url: true });

export type CreateUrlDto = z.infer<typeof createUrlPayloadSchema>;

export const createUrlServiceSchema = createUrlPayloadSchema.required({ created_by: true, id: true });

export type CreateUrlServiceDto = z.infer<typeof createUrlServiceSchema>;
