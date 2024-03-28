import { z } from 'zod';

export const createUrlZObject = z
  .object({
    long_url: z.string().url({ message: 'Invalid Url'}),
    title: z.string(),
    custom_back_half: z.string(),
    generate_qr: z.boolean()
  }).partial();

export const createUrlSchema = createUrlZObject.required({ long_url: true });

export type CreateUrlDto = z.infer<typeof createUrlSchema>;