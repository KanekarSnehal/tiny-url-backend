import { z } from 'zod';

export const createUrlSchema = z
  .object({
    long_url: z.string().url({ message: 'Invalid Url'}).min(1),
    title: z.string(),
    custom_back_half: z.string(),
    generate_qr: z.boolean()
  }).partial();

export type CreateUrlDto = z.infer<typeof createUrlSchema>;